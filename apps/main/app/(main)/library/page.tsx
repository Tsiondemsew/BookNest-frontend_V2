'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Headphones, ArrowRight, Clock, CheckCircle, Loader2, TrendingUp } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { libraryApi } from '@/lib/api/client';
import { mergeProgressFromServer } from '@/lib/progress/progressService';
import { canDownloadOffline } from '@/lib/offline/downloadService';
import type { LibraryItem } from '@repo/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getLocalProgressForBook, syncProgressToBackend } from '@/lib/progress/progressService';
import { downloadBookForOffline, isBookDownloaded, removeOfflineBook, checkStorageSpace } from '@/lib/offline/downloadService';
import { consumePendingReview, wasReviewPromptShown, markReviewPromptShown, hasSubmittedReviewLocally, type PendingReview } from '@/lib/reader/reviewPrompt';
import { ExitReviewPrompt } from '@/features/reviews/components/ExitReviewPrompt';
import { BookReviewModal } from '@/features/reviews/components/BookReviewModal';
import { LibraryBookCard } from '@/features/library/components/LibraryBookCard';
import { reviewsApi } from '@/lib/api/client';
import { saveLibraryCache, getLibraryCache, getLibraryCacheAsync } from '@/lib/offline/libraryCache';
import { mergeLibraryWithOffline } from '@/lib/offline/libraryMerge';
import { getAllOfflineBooks } from '@/lib/db/schema';
import { OfflinePageNotice } from '@/components/OfflinePageNotice';
import { useTranslation } from '@/hooks/useTranslation';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

interface LibraryWithProgress extends LibraryItem {
  localProgress?: number;
  syncedProgress?: number;
}

interface DownloadStatus {
  [key: string]: {
    isDownloading: boolean;
    isDownloaded: boolean;
    downloadPercent?: number;
    error?: string;
  };
}

const fetchLibrary = async (): Promise<LibraryItem[]> => {
  const offlineBooks = await getAllOfflineBooks();

  if (!navigator.onLine) {
    const cached = await getLibraryCacheAsync();
    const merged = mergeLibraryWithOffline(cached, offlineBooks);
    if (merged.length > 0) return merged;
    throw new Error('OFFLINE_NO_LIBRARY');
  }

  try {
    const response = await libraryApi.getLibrary();
    saveLibraryCache(response.data);
    return response.data;
  } catch {
    const cached = await getLibraryCacheAsync();
    const merged = mergeLibraryWithOffline(cached, offlineBooks);
    if (merged.length > 0) return merged;
    throw new Error('LIBRARY_FETCH_FAILED');
  }
};

export default function LibraryPage() {
  const { t } = useTranslation();
  const { isAuthenticated, user, isOfflineMode } = useAuthStore();
  const queryClient = useQueryClient();
  const [libraryWithProgress, setLibraryWithProgress] = useState<LibraryWithProgress[]>([]);
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>({});
  const [storageInfo, setStorageInfo] = useState<{ available: number; isSufficient: boolean }>({ available: 0, isSufficient: true });
  const [exitReview, setExitReview] = useState<PendingReview | null>(null);
  const [reviewTarget, setReviewTarget] = useState<{ bookId: string; bookTitle: string } | null>(null);

  useEffect(() => {
    const pending = consumePendingReview();
    if (!pending || wasReviewPromptShown(pending.bookId) || hasSubmittedReviewLocally(pending.bookId)) {
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await reviewsApi.canReview(pending.bookId);
        if (cancelled) return;
        if (res.data?.existing_review || !res.data?.can_review) {
          markReviewPromptShown(pending.bookId);
          return;
        }
        setExitReview(pending);
      } catch {
        if (!cancelled) setExitReview(pending);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const { data: library, isLoading, isError, refetch } = useQuery({
    queryKey: ['library'],
    queryFn: fetchLibrary,
    enabled: isAuthenticated,
    networkMode: 'offlineFirst',
    staleTime: 5 * 60 * 1000,
    placeholderData: () => {
      const cached = getLibraryCache();
      return cached ?? undefined;
    },
    retry: (count) => navigator.onLine && count < 1,
  });

  // Load storage info
  useEffect(() => {
    const loadStorage = async () => {
      const info = await checkStorageSpace(0);
      setStorageInfo(info);
    };
    if (isAuthenticated) {
      loadStorage();
    }
  }, [isAuthenticated]);

  // Load download status for all books
  useEffect(() => {
    if (!library) return;
    
    const loadStatuses = async () => {
      const statuses: DownloadStatus = {};
      for (const item of library) {
        const downloaded = await isBookDownloaded(item.format.id);
        statuses[item.format.id] = {
          isDownloading: false,
          isDownloaded: downloaded,
        };
      }
      setDownloadStatus(statuses);
    };
    
    loadStatuses();
  }, [library]);

  useEffect(() => {
    if (!isAuthenticated || !user || !library) return;

    const loadProgress = async () => {
      await mergeProgressFromServer(user.id);
      const merged = await Promise.all(
        library.map(async (item) => {
          const localProgressData = await getLocalProgressForBook(user.id, item.format.id);
          const serverPct = item.progress?.progress_percent;
          const localPct = localProgressData?.progressPercent;
          const best =
            serverPct != null && localPct != null
              ? Math.max(serverPct, localPct)
              : serverPct ?? localPct;
          return {
            ...item,
            localProgress: best,
            syncedProgress: serverPct,
          };
        })
      );
      setLibraryWithProgress(merged);
    };

    loadProgress();
  }, [isAuthenticated, user, library]);

  // Sync progress when coming online
  useEffect(() => {
    const handleOnline = () => {
      syncProgressToBackend();
      refetch();
    };
    
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [refetch]);

  // Handle download for offline
  const handleDownload = async (bookFormatId: string, bookTitle: string, formatType: 'PDF' | 'Audio', fileSizeMB: number) => {
  const pwa = canDownloadOffline();
  if (!pwa.allowed) {
    alert(pwa.reason);
    return;
  }

  if (!storageInfo.isSufficient) {
    alert(`⚠️ Not enough storage space.\n\nAvailable: ${storageInfo.available}MB\nNeeded: ${fileSizeMB}MB\n\nPlease free up space and try again.`);
    return;
  }
  
  if (storageInfo.available < fileSizeMB + 20) {
    const confirm = window.confirm(
      `⚠️ Low storage space.\n\nAvailable: ${storageInfo.available}MB\nNeeded: ${fileSizeMB}MB\n\nDownload anyway? It may fail if space is insufficient.`
    );
    if (!confirm) return;
  }
  
  setDownloadStatus(prev => ({
    ...prev,
    [bookFormatId]: {
      ...prev[bookFormatId],
      isDownloading: true,
      downloadPercent: 0,
      error: undefined,
    },
  }));

  const libraryItem = library?.find((i) => i.format.id === bookFormatId);

  const result = await downloadBookForOffline(bookFormatId, bookTitle, formatType, fileSizeMB, {
    onProgress: (percent) => {
      setDownloadStatus((prev) => ({
        ...prev,
        [bookFormatId]: { ...prev[bookFormatId], downloadPercent: percent },
      }));
    },
    coverUrl: libraryItem?.book.cover_image_url,
    bookId: libraryItem?.book.id,
  });

  setDownloadStatus(prev => ({
    ...prev,
    [bookFormatId]: { 
      ...prev[bookFormatId], 
      isDownloading: false,
      downloadPercent: undefined,
      isDownloaded: result.success,
      error: result.error
    }
  }));
  
  if (!result.success) {
    alert(
      t('library.downloadFailed', {
        error: result.error || t('common.loading'),
      })
    );
  } else {
    alert(t('library.downloadReady', { title: bookTitle }));
    const info = await checkStorageSpace(0);
    setStorageInfo(info);
  }
};

  const handleRemoveOffline = async (bookFormatId: string) => {
    if (confirm('Remove this book from offline storage? You can download it again later.')) {
      await removeOfflineBook(bookFormatId);
      setDownloadStatus(prev => ({
        ...prev,
        [bookFormatId]: { ...prev[bookFormatId], isDownloaded: false, isDownloading: false }
      }));
      const info = await checkStorageSpace(0);
      setStorageInfo(info);
    }
  };

  const getDisplayProgress = (item: LibraryWithProgress): number => {
    return item.localProgress ?? item.syncedProgress ?? item.progress?.progress_percent ?? 0;
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <BookOpen size={64} className="mx-auto text-[#4A5568] mb-4" />
        <h1 className="text-2xl font-bold text-[#1A2A3A] mb-2">{t('pages.myLibrary')}</h1>
        <p className="text-[#4A5568] mb-6">{t('library.loginPrompt')}</p>
        <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-[#2C3E50] text-white rounded-lg hover:bg-[#1A2A3A] transition-colors">
          {t('common.signIn')} <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1A2A3A] bn-serif">{t('pages.myLibrary')}</h1>
          <p className="text-sm text-[#4A5568] mt-1">{t('library.loadingCollection')}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-[#E8E2D9] overflow-hidden animate-pulse">
              <div className="aspect-[2/3] bg-gradient-to-br from-[#E8E2D9] to-[#D4CCC0]"></div>
              <div className="p-4 space-y-3">
                <div className="h-5 bg-[#E8E2D9] rounded w-3/4"></div>
                <div className="h-4 bg-[#E8E2D9] rounded w-1/2"></div>
                <div className="h-3 bg-[#E8E2D9] rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError && !library) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <p className="text-red-600 font-medium">
          {!navigator.onLine
            ? t('library.offlineNoCache')
            : t('library.loadFailed')}
        </p>
        <p className="text-sm text-[#4A5568] mt-2">
          {!navigator.onLine ? t('library.connectRetry') : t('library.tryAgainLater')}
        </p>
        {navigator.onLine && (
          <button onClick={() => refetch()} className="mt-4 px-4 py-2 bg-[#2C3E50] text-white rounded-lg text-sm hover:bg-[#1A2A3A] transition-colors">
            {t('common.tryAgain')}
          </button>
        )}
      </div>
    );
  }

  if (!libraryWithProgress || libraryWithProgress.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <BookOpen size={56} className="mx-auto text-[#B85C38]/60 mb-4" />
          <h1 className="text-2xl font-bold text-[#1A2A3A] bn-serif mb-2">{t('library.emptyTitle')}</h1>
          <p className="text-sm text-[#4A5568] mb-6">{t('library.emptyDesc')}</p>
          <Link href="/market" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#B85C38] text-white rounded-xl text-sm font-semibold hover:bg-[#A04E2F] transition-colors">
            {t('common.browseMarketplace')} <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  const totalBooks = libraryWithProgress.length;
  const recentlyPurchased = libraryWithProgress.slice(0, 3);
  const readingStats = {
    totalBooks,
    formats: {
      pdf: libraryWithProgress.filter(item => item.format.type === 'PDF').length,
      audio: libraryWithProgress.filter(item => item.format.type === 'Audio').length,
    },
    inProgress: libraryWithProgress.filter(item => (item.localProgress || item.syncedProgress || 0) > 0 && (item.localProgress || item.syncedProgress || 0) < 100).length,
    completed: libraryWithProgress.filter(item => (item.localProgress || item.syncedProgress || 0) === 100).length,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
      <OfflinePageNotice label={t('library.offlineNotice')} />
      {exitReview && (
        <ExitReviewPrompt pending={exitReview} onDismiss={() => setExitReview(null)} />
      )}
      {reviewTarget && (
        <BookReviewModal
          bookId={reviewTarget.bookId}
          bookTitle={reviewTarget.bookTitle}
          onClose={() => setReviewTarget(null)}
          onSubmitted={() => setReviewTarget(null)}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2A3A] bn-serif">{t('pages.myLibrary')}</h1>
          <p className="text-sm text-[#4A5568] mt-1">
            {totalBooks === 1
              ? t('library.collectionCount_one', { count: totalBooks })
              : t('library.collectionCount_other', { count: totalBooks })}
          </p>
        </div>
        <Link
          href="/dashboard/reading"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E8E2D9] bg-white text-sm font-medium text-[#2C3E50] hover:border-[#B85C38]/30 hover:bg-[#FDFBF7] transition-colors w-fit"
        >
          <TrendingUp size={16} className="text-[#B85C38]" />
          {t('pages.readingJourney')}
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <div className="bg-white rounded-xl border border-[#E8E2D9] p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#2C3E50]/10 rounded-lg">
              <BookOpen size={20} className="text-[#2C3E50]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1A2A3A]">{totalBooks}</p>
              <p className="text-xs text-[#4A5568]">{t('library.totalBooks')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#E8E2D9] p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#B85C38]/10 rounded-lg">
              <BookOpen size={20} className="text-[#B85C38]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1A2A3A]">{readingStats.formats.pdf}</p>
              <p className="text-xs text-[#4A5568]">{t('library.ebooks')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#E8E2D9] p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#8E735B]/10 rounded-lg">
              <Headphones size={20} className="text-[#8E735B]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1A2A3A]">{readingStats.formats.audio}</p>
              <p className="text-xs text-[#4A5568]">{t('library.audiobooks')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#E8E2D9] p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <CheckCircle size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1A2A3A] tabular-nums">{readingStats.completed}</p>
              <p className="text-xs text-[#4A5568]">{t('common.completed')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recently added */}
      {recentlyPurchased.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-[#4A5568] uppercase tracking-wider mb-3">{t('library.continueReading')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {recentlyPurchased.map((item) => {
              const progress = getDisplayProgress(item);
              return (
                <Link key={item.id} href={`/reader/${item.book.id}?format_id=${item.format.id}`} className="group">
                  <div className="flex gap-3 p-3 bg-white rounded-xl border border-[#E8E2D9] hover:border-[#B85C38]/30 hover:shadow-md transition-all">
                    <img src={item.book.cover_image_url} alt={item.book.title} className="w-16 h-20 object-cover rounded-lg" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#1A2A3A] text-sm line-clamp-1 group-hover:text-[#B85C38] transition-colors">{item.book.title}</h3>
                      <p className="text-xs text-[#4A5568] mt-0.5 line-clamp-1">{item.book.author_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-[#F5F1EB] text-[#4A5568] px-1.5 py-0.5 rounded">{item.format.type}</span>
                        {progress > 0 && progress < 100 && (<span className="text-xs text-[#4A5568] flex items-center gap-1"><Clock size={10} />{progress}%</span>)}
                        {progress === 100 && (<span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle size={10} />Completed</span>)}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* All Books Grid */}
      <div>
        <h2 className="text-sm font-semibold text-[#4A5568] uppercase tracking-wider mb-4">{t('library.allBooks')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {libraryWithProgress.map((item) => {
            const progress = getDisplayProgress(item);
            const status = downloadStatus[item.format.id];
            const isDownloaded = status?.isDownloaded || false;
            const isDownloading = status?.isDownloading || false;
            const fileSizeMB = item.format.file_size_bytes
              ? Math.ceil(item.format.file_size_bytes / (1024 * 1024))
              : 10;

            return (
              <LibraryBookCard
                key={item.id}
                item={item}
                progress={progress}
                isDownloaded={isDownloaded}
                isDownloading={isDownloading}
                downloadPercent={status?.downloadPercent}
                isOffline={
                  isOfflineMode ||
                  (typeof navigator !== 'undefined' && !navigator.onLine)
                }
                onDownload={() => handleDownload(item.format.id, item.book.title, item.format.type, fileSizeMB)}
                onRemoveOffline={() => handleRemoveOffline(item.format.id)}
                onReviewClick={(bookId, bookTitle) => setReviewTarget({ bookId, bookTitle })}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}