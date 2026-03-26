'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useBooks } from '@/hooks/useBooks';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/Skeleton';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import BookCard from '@/components/BookCard';

type LibraryFilter = 'all' | 'reading' | 'finished' | 'wishlist';

export default function LibraryPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<LibraryFilter>('all');

  const {
    userLibrary,
    isLoadingLibrary,
    errorLibrary,
    removeFromLibrary,
    updateReadingProgress,
  } = useBooks();

  const filters: { label: string; value: LibraryFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Currently Reading', value: 'reading' },
    { label: 'Finished', value: 'finished' },
    { label: 'Wishlist', value: 'wishlist' },
  ];

  // Filter books based on selected filter
  const filteredBooks =
    filter === 'all'
      ? userLibrary
      : userLibrary.filter((item: any) => {
          const progress = item.progress || 0;
          if (filter === 'reading') return progress > 0 && progress < 100;
          if (filter === 'finished') return progress === 100;
          if (filter === 'wishlist') return progress === 0;
          return true;
        });

  return (
    <div className="px-4 py-6 pb-24">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-balance text-foreground">My Library</h1>
        <p className="text-foreground/60 mt-2">{user?.displayName || 'Your'} collection</p>
      </header>

      {/* Filter tabs */}
      <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
        {filters.map((item) => (
          <button
            key={item.value}
            onClick={() => setFilter(item.value)}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
              filter === item.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
            aria-pressed={filter === item.value}
            aria-label={`Filter by ${item.label}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Error State */}
      {errorLibrary && <ErrorDisplay error={errorLibrary} onRetry={() => {}} />}

      {/* Loading State */}
      {isLoadingLibrary && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      )}

      {/* Books Grid */}
      {!isLoadingLibrary && filteredBooks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredBooks.map((item: any) => (
            <div key={item.id} className="relative">
              <Link href={`/book/${item.id}`}>
                <BookCard
                  book={item}
                  showProgress={true}
                  progress={item.progress || 0}
                />
              </Link>
              <button
                onClick={() => removeFromLibrary(item.id)}
                className="absolute top-2 left-2 bg-destructive/90 text-destructive-foreground p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Remove ${item.title} from library`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoadingLibrary && filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-foreground/60">No books in this collection yet</p>
          <Link href="/discover" className="text-primary font-semibold mt-4 inline-block">
            Discover Books
          </Link>
        </div>
      )}
    </div>
  );
}
