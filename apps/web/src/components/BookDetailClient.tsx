'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useBooks } from '@/hooks/useBooks';
import { useRouter } from 'next/navigation';
import { Skeleton } from './Skeleton';
import { ErrorDisplay } from './ErrorDisplay';
import { Button } from './Button';

interface BookDetailClientProps {
  bookId: string;
}

export default function BookDetailClient({ bookId }: BookDetailClientProps) {
  const router = useRouter();
  const { getBookById, addToLibrary, updateReadingProgress, isLoading, error } = useBooks();
  const [isAdding, setIsAdding] = useState(false);

  const book = getBookById(bookId);
  const currentProgress = book?.userProgress || 0;

  const handleAddToLibrary = async () => {
    setIsAdding(true);
    try {
      await addToLibrary(bookId);
    } finally {
      setIsAdding(false);
    }
  };

  const handleStartReading = async () => {
    setIsAdding(true);
    try {
      await updateReadingProgress(bookId, 1);
      router.push(`/reader?bookId=${bookId}`);
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 py-6 pb-24">
        <Skeleton className="h-96 mb-6 rounded-lg" />
        <Skeleton className="h-12 mb-4 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="px-4 py-6">
        <ErrorDisplay
          error={error || new Error('Book not found')}
          onRetry={() => router.back()}
        />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 pb-24">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="text-primary mb-6 flex items-center gap-2 hover:underline"
      >
        ← Back
      </button>

      {/* Book Cover and Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Cover */}
        <div className="col-span-1">
          <div className="aspect-[2/3] rounded-lg overflow-hidden bg-secondary/20 flex items-center justify-center">
            {book.coverUrl ? (
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-6xl">📚</div>
            )}
          </div>
        </div>

        {/* Book Info */}
        <div className="col-span-1 md:col-span-2">
          <h1 className="text-3xl font-bold text-foreground mb-2">{book.title}</h1>
          <p className="text-lg text-foreground/60 mb-4">by {book.author}</p>

          {/* Rating and Stats */}
          <div className="flex gap-6 mb-6 text-sm">
            <div>
              <p className="text-foreground/60">Rating</p>
              <p className="text-lg font-semibold">★ {book.rating?.toFixed(1) || 'N/A'}</p>
            </div>
            <div>
              <p className="text-foreground/60">Reviews</p>
              <p className="text-lg font-semibold">{book.reviewCount || 0}</p>
            </div>
            <div>
              <p className="text-foreground/60">Category</p>
              <p className="text-lg font-semibold">{book.category}</p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">About</h2>
            <p className="text-foreground/70 leading-relaxed">{book.description}</p>
          </div>

          {/* Reading Progress */}
          {currentProgress > 0 && (
            <div className="mb-6 p-4 rounded-lg bg-muted">
              <p className="text-sm text-foreground/60 mb-2">Your Progress</p>
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl font-bold text-primary">{Math.round(currentProgress)}%</div>
                <span className="text-sm text-foreground/60">
                  {Math.round((currentProgress / 100) * (book.pageCount || 300))} /{' '}
                  {book.pageCount || 300} pages
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-secondary/30">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${currentProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {currentProgress > 0 ? (
              <Button onClick={handleStartReading} disabled={isAdding}>
                {isAdding ? 'Loading...' : 'Continue Reading'}
              </Button>
            ) : (
              <>
                <Button onClick={handleStartReading} disabled={isAdding}>
                  {isAdding ? 'Loading...' : 'Start Reading'}
                </Button>
                <Button
                  onClick={handleAddToLibrary}
                  disabled={isAdding}
                  variant="outline"
                >
                  {isAdding ? 'Adding...' : 'Add to Wishlist'}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Book Details */}
        <div className="border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Book Details</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-foreground/60">Pages</span>
              <span className="font-semibold">{book.pageCount || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Published</span>
              <span className="font-semibold">
                {book.publishedDate
                  ? new Date(book.publishedDate).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Language</span>
              <span className="font-semibold">{book.language || 'English'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">ISBN</span>
              <span className="font-semibold">{book.isbn || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Community</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-foreground/60">People Reading</span>
              <span className="font-semibold">{Math.floor(Math.random() * 1000) + 100}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">In Wishlists</span>
              <span className="font-semibold">{Math.floor(Math.random() * 500) + 50}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Completed</span>
              <span className="font-semibold">{Math.floor(Math.random() * 2000) + 200}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Books Section */}
      <div className="mt-12">
        <h3 className="text-lg font-semibold mb-4">More from {book.author}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-lg bg-secondary/10 p-3 text-center cursor-pointer hover:bg-secondary/20 transition-colors"
            >
              <div className="aspect-[2/3] rounded bg-secondary/20 mb-2 flex items-center justify-center">
                📚
              </div>
              <p className="text-sm font-semibold line-clamp-2">Related Book {i}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
