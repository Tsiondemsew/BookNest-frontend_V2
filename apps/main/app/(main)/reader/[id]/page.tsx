'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { PDFReader, AudioPlayer } from '@/features/reader';
import { Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import type { LibraryItem } from '@repo/types';
import { fetchLibraryForQuery } from '@/lib/offline/fetchLibrary';
import { resolveReaderLibraryItem } from '@/lib/offline/resolveReaderBook';
import { getLibraryCache } from '@/lib/offline/libraryCache';
import { isBookDownloaded } from '@/lib/offline/downloadService';
import { useTranslation } from '@/hooks/useTranslation';

export default function ReaderPage() {
  const { t } = useTranslation();
  const params = useParams();
  const searchParams = useSearchParams();
  const bookId = params.id as string;
  const formatId = searchParams.get('format_id');

  const { data: libraryRes, isLoading } = useQuery({
    queryKey: ['library'],
    queryFn: fetchLibraryForQuery,
    networkMode: 'offlineFirst',
    staleTime: 5 * 60 * 1000,
    placeholderData: () => getLibraryCache() ?? undefined,
    retry: (count) => navigator.onLine && count < 1,
  });

  const { data: resolvedItem, isLoading: resolving } = useQuery({
    queryKey: ['reader-item', bookId, formatId],
    queryFn: () => resolveReaderLibraryItem(bookId, formatId!),
    enabled: !!formatId,
    networkMode: 'offlineFirst',
    staleTime: Infinity,
    retry: false,
  });

  const libraryItem: LibraryItem | undefined = useMemo(() => {
    if (resolvedItem) return resolvedItem;
    if (!libraryRes || !formatId) return undefined;
    return (
      libraryRes.find((item) => item.book.id === bookId && item.format.id === formatId) ??
      libraryRes.find((item) => item.format.id === formatId)
    );
  }, [resolvedItem, libraryRes, bookId, formatId]);

  const loading = isLoading || resolving;

  if (loading && !libraryItem) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 size={48} className="animate-spin text-[#B85C38]" />
      </div>
    );
  }

  if (!libraryItem || !formatId) {
    return <ReaderOpenError offline={typeof navigator !== 'undefined' && !navigator.onLine} />;
  }

  const { book, format } = libraryItem;

  if (format.type === 'PDF') {
    return (
      <PDFReader
        bookFormatId={format.id}
        bookId={book.id}
        bookTitle={book.title}
        fileUrl=""
        totalPages={format.page_count || 100}
      />
    );
  }

  if (format.type === 'Audio') {
    return (
      <AudioPlayer
        bookFormatId={format.id}
        bookId={book.id}
        bookTitle={book.title}
        bookAuthor={book.author_name}
        coverImage={book.cover_image_url}
        audioUrl=""
        totalDuration={format.duration_sec || 3600}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <p className="text-gray-600">Unsupported format</p>
    </div>
  );
}

function ReaderOpenError({ offline }: { offline: boolean }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4 max-w-md mx-auto text-center">
      <AlertCircle size={48} className="text-red-500 mb-4" />
      <h1 className="text-xl font-semibold mb-2">{t('reader.cannotOpen')}</h1>
      <p className="text-gray-600 mb-6">
        {offline ? t('reader.offlineNotDownloaded') : t('reader.notInLibrary')}
      </p>
      <Link
        href="/library"
        className="px-5 py-2.5 bg-[#B85C38] text-white rounded-lg text-sm font-medium hover:bg-[#8E735B]"
      >
        {t('offline.backToLibrary')}
      </Link>
    </div>
  );
}
