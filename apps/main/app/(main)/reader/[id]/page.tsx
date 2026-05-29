'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { PDFReader, AudioPlayer } from '@/features/reader';
import { Loader2, AlertCircle } from 'lucide-react';
import { libraryApi } from '@/lib/api/client';
import { useMemo } from 'react';
import type { LibraryItem } from '@repo/types';

export default function ReaderPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const bookId = params.id as string;
  const formatId = searchParams.get('format_id');

  const { data: libraryRes, isLoading, isError } = useQuery({
    queryKey: ['library'],
    queryFn: async () => {
      const res = await libraryApi.getLibrary();
      return res.data;
    },
  });

  const libraryItem: LibraryItem | undefined = useMemo(() => {
    if (!libraryRes || !formatId) return undefined;
    return libraryRes.find(
      (item) => item.book.id === bookId && item.format.id === formatId
    );
  }, [libraryRes, bookId, formatId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 size={48} className="animate-spin text-[#B85C38]" />
      </div>
    );
  }

  if (isError || !libraryItem || !formatId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h1 className="text-xl font-semibold mb-2">Cannot Open Book</h1>
        <p className="text-gray-600 text-center">
          This book is not in your library or the format is invalid. Purchase it from the marketplace first.
        </p>
      </div>
    );
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
