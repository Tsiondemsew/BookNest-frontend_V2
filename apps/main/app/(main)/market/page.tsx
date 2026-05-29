'use client';

import { Suspense, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { BookGrid, BookFilters, BookPagination } from '@/features/books/components';
import { useBooks, useGenres, usePersonalizedBooks } from '@/features/books/hooks';
import { useAuthStore } from '@/stores/authStore';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const PAGE_SIZE = 12;

function MarketPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();

  const genre = searchParams.get('genre') || '';
  const format = searchParams.get('format') || '';
  const search = searchParams.get('search') || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

  const hasActiveFilters = Boolean(genre || format || search);
  const mergePersonalized = isAuthenticated && !hasActiveFilters && page === 1;

  const { data: personalizedData, isLoading: personalizedLoading } = usePersonalizedBooks(
    PAGE_SIZE,
    mergePersonalized
  );

  const { data: booksData, isLoading, isFetching, isError } = useBooks({
    genre: genre || undefined,
    format: format as 'PDF' | 'Audio' | undefined,
    search: search || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const { data: genres, isLoading: genresLoading } = useGenres();

  const pushParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      router.push(`/market?${params.toString()}`);
    },
    [router, searchParams]
  );

  const updateFilters = useCallback(
    (key: string, value: string) => {
      const updates: Record<string, string | null> = {};

      if (key === 'genre') {
        if (value === genre) return;
        updates.genre = value || null;
      }
      if (key === 'format') {
        if (value === format) return;
        updates.format = value || null;
      }
      if (key === 'search') {
        if (value === search) return;
        updates.search = value || null;
      }

      updates.page = '1';
      pushParams(updates);
    },
    [genre, format, search, pushParams]
  );

  const clearAllFilters = useCallback(() => {
    pushParams({
      genre: null,
      format: null,
      search: null,
      page: '1',
    });
  }, [pushParams]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage < 1) return;
      pushParams({ page: String(newPage) });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [pushParams]
  );

  const books = booksData?.books || [];
  const pagination = booksData?.pagination;
  const total = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 0;
  const currentPage = page;
  const hasNextPage = currentPage < totalPages;
  const showPagination = totalPages > 1 || currentPage > 1 || hasNextPage;

  const personalizedBooks = personalizedData?.books ?? [];
  const hasPersonalized =
    mergePersonalized &&
    Boolean(personalizedData?.meta?.personalized) &&
    personalizedBooks.length > 0;

  const displayBooks = useMemo(() => {
    if (!hasPersonalized) return books;
    const favoriteIds = new Set(personalizedBooks.map((b) => b.id));
    const rest = books.filter((b) => !favoriteIds.has(b.id));
    return [...personalizedBooks, ...rest];
  }, [books, personalizedBooks, hasPersonalized]);

  const rangeStart = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, total);

  useEffect(() => {
    if (!isFetching && pagination && page > pagination.totalPages && pagination.totalPages > 0) {
      pushParams({ page: String(pagination.totalPages) });
    }
  }, [isFetching, pagination, page, pushParams]);

  return (
    <div className="min-h-10 bg-[#FDFBF7]">
      <div className="relative bg-gradient-to-r from-[#2C3E50] to-[#1A2A3A] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-24 bg-[#B85C38] rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-80 h-40 bg-[#8E735B] rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">Discover your next read</h1>
          <p className="text-[#8E735B] text-base md:text-lg max-w-2xl">
            {hasPersonalized
              ? 'Your favorite genres appear first — browse the full marketplace below'
              : 'Browse thousands of books from independent authors and publishers'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <BookFilters
            genres={genres || []}
            selectedGenre={genre}
            selectedFormat={format}
            initialSearch={search}
            onGenreChange={(value) => updateFilters('genre', value)}
            onFormatChange={(value) => updateFilters('format', value)}
            onSearchChange={(value) => updateFilters('search', value)}
          />
        </div>

        <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
          <p className="text-sm text-[#4A5568]">
            {!isLoading && !isError && total > 0 && (
              <>
                Showing{' '}
                <span className="font-semibold text-[#1A2A3A]">
                  {rangeStart}–{rangeEnd}
                </span>{' '}
                of <span className="font-semibold text-[#1A2A3A]">{total}</span> books
              </>
            )}
            {!isLoading && !isError && total === 0 && (
              <span>No books match your filters</span>
            )}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-sm text-[#B85C38] hover:text-[#8E735B] transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>

        {isError && (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#E8E2D9]">
            <div className="text-5xl mb-4">😔</div>
            <p className="text-[#4A5568]">Failed to load books. Please try again.</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-[#2C3E50] text-white rounded-lg text-sm hover:bg-[#1A2A3A] transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        <BookGrid
          books={displayBooks}
          isLoading={isLoading || genresLoading || (mergePersonalized && personalizedLoading)}
        />

        {showPagination && (
          <div className="mt-10">
            <BookPagination
              currentPage={totalPages > 0 ? Math.min(currentPage, totalPages) : currentPage}
              totalPages={totalPages}
              hasNextPage={hasNextPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function MarketPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
          <div className="animate-pulse text-center">
            <div className="w-12 h-12 border-4 border-[#2C3E50] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-[#4A5568] mt-4">Loading marketplace...</p>
          </div>
        </div>
      }
    >
      <MarketPageContent />
    </Suspense>
  );
}
