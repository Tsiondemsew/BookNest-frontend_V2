'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

type LibraryFilter = 'all' | 'reading' | 'finished' | 'wishlist';

/**
 * Library page - User's book collection and reading progress
 */
export default function LibraryPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<LibraryFilter>('all');

  const filters: { label: string; value: LibraryFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Currently Reading', value: 'reading' },
    { label: 'Finished', value: 'finished' },
    { label: 'Wishlist', value: 'wishlist' },
  ];

  return (
    <div className="px-4 py-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">My Library</h1>
        <p className="text-foreground/60 mt-2">
          {user?.displayName}&apos;s collection
        </p>
      </header>

      {/* Filter tabs */}
      <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
        {filters.map((item) => (
          <button
            key={item.value}
            onClick={() => setFilter(item.value)}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
              filter === item.value
                ? 'bg-primary text-white'
                : 'bg-muted text-foreground hover:bg-foreground/10'
            }`}
            aria-pressed={filter === item.value}
            aria-label={`Filter by ${item.label}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Books grid */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex gap-4 p-4 rounded-lg border border-border hover:bg-muted transition-colors cursor-pointer"
          >
            <div className="w-16 h-24 rounded bg-secondary/20 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">
                Book Title {i}
              </h3>
              <p className="text-sm text-foreground/60 mt-1">By Author Name</p>

              {/* Reading progress */}
              <div className="mt-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-foreground/60">
                    Progress
                  </span>
                  <span className="text-xs font-medium text-foreground">
                    {i * 20}%
                  </span>
                </div>
                <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${i * 20}%` }}
                    role="progressbar"
                    aria-valuenow={i * 20}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {false && (
        <div className="text-center py-12">
          <p className="text-foreground/60">No books in this collection yet</p>
          <a href="/discover" className="text-primary font-semibold mt-2 inline-block">
            Explore books
          </a>
        </div>
      )}
    </div>
  );
}
