'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';

/**
 * Discover page - Book discovery and browsing
 */
export default function DiscoverPage() {
  const { user } = useAuth();

  return (
    <div className="px-4 py-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Discover</h1>
        <p className="text-foreground/60 mt-2">
          Find your next favorite book
        </p>
      </header>

      {/* Search section */}
      <div className="mb-8">
        <input
          type="search"
          placeholder="Search books, authors..."
          className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Search books"
        />
      </div>

      {/* Categories section */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Categories
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {['Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Sci-Fi', 'Biography'].map(
            (category) => (
              <button
                key={category}
                className="px-4 py-3 rounded-lg border border-border bg-muted hover:bg-primary/10 text-foreground transition-colors text-sm font-medium"
                aria-label={`Browse ${category} books`}
              >
                {category}
              </button>
            )
          )}
        </div>
      </section>

      {/* Featured section */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Featured Books
        </h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex gap-4 p-4 rounded-lg border border-border hover:bg-muted transition-colors cursor-pointer"
            >
              <div className="w-16 h-24 rounded bg-secondary/20 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">
                  Book Title {i}
                </h3>
                <p className="text-sm text-foreground/60 mt-1">By Author Name</p>
                <div className="mt-2 flex gap-2">
                  <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary">
                    Fiction
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
