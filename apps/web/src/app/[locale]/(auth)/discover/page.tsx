'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useBooks } from '@/hooks/useBooks';
import { useAuth } from '@/hooks/useAuth';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { Skeleton } from '@/components/Skeleton';
import BookCard from '@/components/BookCard';
import { Button } from '@/components/Button';

const CATEGORIES = [
  'Fiction',
  'Non-Fiction',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Biography',
  'History',
  'Self-Help',
];

export default function DiscoverPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'trending' | 'newest' | 'rating'>('trending');

  const {
    discoveredBooks,
    featuredBooks,
    isLoadingDiscovered,
    isLoadingFeatured,
    errorDiscovered,
    errorFeatured,
    searchBooks,
    getByCategory,
  } = useBooks();

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchBooks(searchQuery);
    }
  };

  // Handle category filter
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
    if (selectedCategory !== category) {
      getByCategory(category);
    }
  };

  // Display search results if query is active
  const isSearching = searchQuery.trim().length > 0;
  const booksToDisplay = isSearching || selectedCategory ? discoveredBooks : featuredBooks;
  const isLoading = isSearching || selectedCategory ? isLoadingDiscovered : isLoadingFeatured;
  const error = isSearching || selectedCategory ? errorDiscovered : errorFeatured;

  return (
    <div className="px-4 py-6 pb-24">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-balance text-foreground">Discover Books</h1>
        <p className="text-foreground/60 mt-2">Explore thousands of stories and authors</p>
      </header>

      {/* Search Section */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search books, authors..."
            className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Search books"
          />
          <Button type="submit" aria-label="Search">
            Search
          </Button>
        </div>
      </form>

      {/* Categories Section */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Categories</h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => handleCategorySelect(category)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
              aria-pressed={selectedCategory === category}
              aria-label={`Filter by ${category}`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Sort Controls */}
      {booksToDisplay.length > 0 && (
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-foreground/60">
            {booksToDisplay.length} {selectedCategory ? 'books found' : 'featured books'}
          </p>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 rounded bg-muted border border-border text-foreground text-sm"
            aria-label="Sort books by"
          >
            <option value="trending">Trending</option>
            <option value="newest">Newest</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      )}

      {/* Error State */}
      {error && <ErrorDisplay error={error} onRetry={() => {}} />}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      )}

      {/* Books Grid */}
      {!isLoading && booksToDisplay.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {booksToDisplay.map((book) => (
            <Link key={book.id} href={`/book/${book.id}`}>
              <BookCard book={book} />
            </Link>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && booksToDisplay.length === 0 && (
        <div className="text-center py-12">
          <p className="text-foreground/60">
            {isSearching ? 'No books found matching your search.' : 'No books available yet.'}
          </p>
          {isSearching && (
            <Button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
              }}
              className="mt-4"
            >
              Clear Search
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
