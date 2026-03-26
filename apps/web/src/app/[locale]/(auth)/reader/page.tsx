'use client';

import { useSearchParams } from 'next/navigation';
import ReaderInterface from '@/components/ReaderInterface';
import { useBooks } from '@/hooks/useBooks';
import { Skeleton } from '@/components/Skeleton';
import Link from 'next/link';

export default function ReaderPage() {
  const searchParams = useSearchParams();
  const bookId = searchParams.get('bookId') || '';
  const { getBookById, isLoading } = useBooks();

  const book = getBookById(bookId);

  if (isLoading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  if (!book || !bookId) {
    return (
      <div className="px-4 py-6">
        <header>
          <h1 className="text-3xl font-bold text-foreground">Reader</h1>
          <p className="text-foreground/60 mt-2">Open a book from your library to start reading</p>
        </header>

        <div className="mt-8 p-8 rounded-lg border border-border text-center">
          <div className="text-6xl mb-4">📖</div>
          <h2 className="text-xl font-semibold text-foreground mb-2">No book selected</h2>
          <p className="text-foreground/60">Choose a book from your library to begin reading</p>
          <Link
            href="/library"
            className="mt-4 inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go to Library
          </Link>
        </div>
      </div>
    );
  }

  return <ReaderInterface book={book} />;
}
