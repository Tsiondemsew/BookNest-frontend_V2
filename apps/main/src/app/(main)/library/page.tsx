'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Headphones, ArrowRight, Clock, Download, CheckCircle, Loader2, WifiOff } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { apiClient } from '@/lib/api/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getLocalProgressForBook, syncProgressToBackend } from '@/lib/progress/progressService';
import { downloadBookForOffline, isBookDownloaded, removeOfflineBook, checkStorageSpace } from '@/lib/offline/downloadService';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

interface LibraryItem {
  id: string;
  purchased_at: string;
  last_read?: string;
  progress?: number;
  format: {
    id: string;
    type: 'PDF' | 'Audio';
    price: number;
    currency: string;
    storage_path: string;
    file_url: string | null;
  };
  book: {
    id: string;
    title: string;
    subtitle?: string;
    description?: string;
    author_name: string;
    publisher_name?: string;
    cover_image_url: string;
    language: string;
    page_count?: number;
    duration_sec?: number;
  };
}

interface LibraryWithProgress extends LibraryItem {
  localProgress?: number;
  syncedProgress?: number;
}

interface DownloadStatus {
  [key: string]: {
    isDownloading: boolean;
    isDownloaded: boolean;
    error?: string;
  };
}

const fetchLibrary = async (): Promise<LibraryItem[]> => {
  const response = await apiClient.get<{ success: boolean; data: LibraryItem[] }>('/api/library');
  return response.data;
};

export default function LibraryPage() {
  const { isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();
  const [libraryWithProgress, setLibraryWithProgress] = useState<LibraryWithProgress[]>([]);
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>({});
  const [storageInfo, setStorageInfo] = useState<{ available: number; isSufficient: boolean }>({ available: 0, isSufficient: true });
  
  const { data: library, isLoading, isError, refetch } = useQuery({
    queryKey: ['library'],
    queryFn: fetchLibrary,
    enabled: isAuthenticated,
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

  // Load local progress from IndexedDB and merge with library data
  useEffect(() => {
    if (!isAuthenticated || !user || !library) return;
    
    const loadProgress = async () => {
      const merged = await Promise.all(
        library.map(async (item) => {
          const localProgressData = await getLocalProgressForBook(user.id, item.format.id);
          return {
            ...item,
            localProgress: localProgressData?.progressPercent,
            syncedProgress: item.progress,
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
  // Show storage warning before attempting download
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
    [bookFormatId]: { ...prev[bookFormatId], isDownloading: true, error: undefined }
  }));
  
  const result = await downloadBookForOffline(bookFormatId, bookTitle, formatType, fileSizeMB);
  
  setDownloadStatus(prev => ({
    ...prev,
    [bookFormatId]: { 
      ...prev[bookFormatId], 
      isDownloading: false, 
      isDownloaded: result.success,
      error: result.error
    }
  }));
  
  if (!result.success) {
    alert(`❌ Download failed: ${result.error || 'Unknown error'}`);
  } else {
    alert(`✅ "${bookTitle}" downloaded successfully!\n\nYou can now read it offline.`);
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
    return item.localProgress !== undefined ? item.localProgress : (item.syncedProgress || 0);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <BookOpen size={64} className="mx-auto text-[#4A5568] mb-4" />
        <h1 className="text-2xl font-bold text-[#1A2A3A] mb-2">My Library</h1>
        <p className="text-[#4A5568] mb-6">Please login to view your purchased books.</p>
        <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-[#2C3E50] text-white rounded-lg hover:bg-[#1A2A3A] transition-colors">
          Sign In <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2A3A] mb-2">My Library</h1>
          <p className="text-[#4A5568] mb-6">Your collection of purchased books</p>
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

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-red-500">Failed to load your library. Please try again.</p>
        <button onClick={() => refetch()} className="mt-4 px-4 py-2 bg-[#2C3E50] text-white rounded-lg text-sm hover:bg-[#1A2A3A] transition-colors">
          Try Again
        </button>
      </div>
    );
  }

  if (!libraryWithProgress || libraryWithProgress.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <BookOpen size={64} className="mx-auto text-[#4A5568] mb-4" />
          <h1 className="text-2xl font-bold text-[#1A2A3A] mb-2">Your Library is Empty</h1>
          <p className="text-[#4A5568] mb-6">You haven't purchased any books yet. Start your reading journey today!</p>
          <Link href="/market" className="inline-flex items-center gap-2 px-6 py-3 bg-[#2C3E50] text-white rounded-lg hover:bg-[#1A2A3A] transition-colors">
            Browse Marketplace <ArrowRight size={18} />
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
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1A2A3A]">My Library</h1>
        <p className="text-[#4A5568] mt-1">Your collection of purchased books</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-[#E8E2D9] p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#2C3E50]/10 rounded-lg">
              <BookOpen size={20} className="text-[#2C3E50]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1A2A3A]">{totalBooks}</p>
              <p className="text-xs text-[#4A5568]">Total Books</p>
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
              <p className="text-xs text-[#4A5568]">eBooks (PDF)</p>
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
              <p className="text-xs text-[#4A5568]">Audiobooks</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#E8E2D9] p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1A2A3A]">{readingStats.completed}</p>
              <p className="text-xs text-[#4A5568]">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-[#E8E2D9] p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#4A5568]/10 rounded-lg">
              <Download size={20} className="text-[#4A5568]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1A2A3A]">{storageInfo.available}MB</p>
              <p className="text-xs text-[#4A5568]">Storage Free</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recently Added Section */}
      {recentlyPurchased.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#1A2A3A]">Recently Added</h2>
            <Link href="/library/all" className="text-sm text-[#B85C38] hover:text-[#8E735B] transition-colors">
              View all →
            </Link>
          </div>
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
        <h2 className="text-lg font-semibold text-[#1A2A3A] mb-4">All Books</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {libraryWithProgress.map((item) => {
            const progress = getDisplayProgress(item);
            const status = downloadStatus[item.format.id];
            const isDownloaded = status?.isDownloaded || false;
            const isDownloading = status?.isDownloading || false;
            const fileUrl = item.format.file_url;
            const fileSizeMB = 10; // TODO: Get actual file size from API
            
            return (
              <div key={item.id} className="group">
                <div className="bg-white rounded-xl border border-[#E8E2D9] overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <Link href={`/reader/${item.book.id}?format_id=${item.format.id}`}>
                    <div className="aspect-[2/3] relative overflow-hidden bg-[#F5F1EB]">
                      <img src={item.book.cover_image_url} alt={item.book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400" />
                      <div className="absolute top-2 right-2">
                        <span className="text-xs bg-white/90 backdrop-blur-sm text-[#2C3E50] px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                          {item.format.type === 'PDF' ? <BookOpen size={12} /> : <Headphones size={12} />}
                          {item.format.type}
                        </span>
                      </div>
                      {isDownloaded && (
                        <div className="absolute top-2 left-2">
                          <span className="text-xs bg-green-500/90 text-white px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                            <CheckCircle size={10} />
                            Offline
                          </span>
                        </div>
                      )}
                      {!navigator.onLine && !isDownloaded && (
                        <div className="absolute top-2 left-2">
                          <span className="text-xs bg-yellow-500/90 text-white px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                            <WifiOff size={10} />
                            Offline only
                          </span>
                        </div>
                      )}
                      {progress > 0 && progress < 100 && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
                          <div className="h-full bg-[#B85C38]" style={{ width: `${progress}%` }} />
                        </div>
                      )}
                      {progress === 100 && <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500" />}
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link href={`/reader/${item.book.id}?format_id=${item.format.id}`}>
                      <h3 className="font-semibold text-[#1A2A3A] text-base line-clamp-1 group-hover:text-[#B85C38] transition-colors">{item.book.title}</h3>
                    </Link>
                    <p className="text-sm text-[#4A5568] mt-1 line-clamp-1">{item.book.author_name}</p>
                    
                    {progress > 0 && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-[#4A5568] mb-1"><span>Progress</span><span>{progress}%</span></div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-[#B85C38] h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xs text-[#4A5568]">Added: {new Date(item.purchased_at).toLocaleDateString()}</p>
                      <div className="flex items-center gap-2">
                        {isDownloaded ? (
                          <button onClick={() => handleRemoveOffline(item.format.id)} className="p-1.5 text-green-600 hover:text-red-500 transition-colors" title="Remove from offline">
                            <CheckCircle size={14} />
                          </button>
                        ) : (
                          <button
  onClick={() => handleDownload(item.format.id, item.book.title, item.format.type, fileSizeMB)}
  disabled={isDownloading}
  className="p-1.5 text-[#4A5568] hover:text-[#B85C38] transition-colors disabled:opacity-50"
  title="Download for offline"
>
  {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
</button>
                        )}
                        <Link href={`/reader/${item.book.id}?format_id=${item.format.id}`} className="text-sm text-[#B85C38] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          {progress === 100 ? 'Review →' : (progress > 0 ? 'Continue →' : 'Start →')}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}