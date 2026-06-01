'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useBook } from '@/features/books/hooks/useBooks';
import { PDFReader, AudioPlayer } from '@/features/reader';
import { Loader2, AlertCircle } from 'lucide-react';
import { isBookDownloaded } from '@/lib/offline/downloadService';
import { useEffect, useState } from 'react';

export default function ReaderPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const bookId = params.id as string;
  const formatId = searchParams.get('format_id');
  const [isOfflineAvailable, setIsOfflineAvailable] = useState(false);
  
  const { data: book, isLoading, isError } = useBook(bookId);
  const selectedFormat = book?.formats?.find(f => f.id === formatId);
  
  // Check if book is downloaded for offline
  useEffect(() => {
    if (formatId) {
      isBookDownloaded(formatId).then(setIsOfflineAvailable);
    }
  }, [formatId]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 size={48} className="animate-spin text-[#B85C38]" />
      </div>
    );
  }
  
  if (isError || !book || !selectedFormat) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h1 className="text-xl font-semibold mb-2">Cannot Open Book</h1>
        <p className="text-gray-600 text-center">
          The book could not be loaded. Please check your connection and try again.
        </p>
      </div>
    );
  }
  
  // ✅ If downloaded, use /api/download (works offline)
  // ✅ If not downloaded, use file_url from backend (requires online)
  const fileUrl = isOfflineAvailable 
    ? `/api/download/${selectedFormat.id}`
    : selectedFormat.file_url;
  
  if (!fileUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h1 className="text-xl font-semibold mb-2">File Not Available</h1>
        <p className="text-gray-600 text-center">
          This book is not downloaded and cannot be streamed online. Please check your connection.
        </p>
      </div>
    );
  }
  
  if (selectedFormat.format_type === 'PDF') {
    return (
      <PDFReader
        bookFormatId={selectedFormat.id}
        bookTitle={book.title}
        fileUrl={fileUrl}
        totalPages={selectedFormat.page_count || 100}
      />
    );
  }
  
  if (selectedFormat.format_type === 'Audio') {
    return (
      <AudioPlayer
        bookFormatId={selectedFormat.id}
        bookTitle={book.title}
        bookAuthor={book.author_name}
        bookDescription={book.description}
        coverImage={book.cover_image_url}
        audioUrl={fileUrl}
        totalDuration={selectedFormat.duration_sec || 3600}
      />
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <p className="text-gray-600">Unsupported format</p>
    </div>
  );
}