'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { BookGrid, BookFilters, BookPagination } from '@/features/books/components';
import { useBooks, useGenres } from '@/features/books/hooks'; 

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

function MarketPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [genre, setGenre] = useState(searchParams.get('genre') || '');
  const [format, setFormat] = useState(searchParams.get('format') || '');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));

  const { data: booksData, isLoading, isError } = useBooks({
    genre: genre || undefined,
    format: format as any,
    search: search || undefined,
    page,
    limit: 12,
  });

  const { data: genres, isLoading: genresLoading } = useGenres();

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    router.push(`/market?${params.toString()}`);
    
    if (key === 'genre') setGenre(value);
    if (key === 'format') setFormat(value);
    if (key === 'search') setSearch(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/market?${params.toString()}`);
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const books = booksData?.books || [];
  const pagination = booksData?.pagination;

  return (
    <div className="min-h-10 bg-[#FDFBF7]">
      {/* Hero Banner - Decent */}
      <div className="relative bg-gradient-to-r from-[#2C3E50] to-[#1A2A3A] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-24 bg-[#B85C38] rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-80 h-40 bg-[#8E735B] rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
            Discover your next read
          </h1>
          <p className="text-[#8E735B] text-base md:text-lg max-w-2xl">
            Browse thousands of books from independent authors and publishers
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Section - Improved */}
        <div className="mb-8">
          <BookFilters
            genres={genres || []}
            selectedGenre={genre}
            selectedFormat={format}
            onGenreChange={(value) => updateFilters('genre', value)}
            onFormatChange={(value) => updateFilters('format', value)}
            onSearchChange={(value) => updateFilters('search', value)}
          />
        </div>
        
        {/* Results header */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-[#4A5568]">
            {!isLoading && !isError && (
              <>Showing <span className="font-semibold text-[#1A2A3A]">{books.length}</span> books</>
            )}
          </p>
          {(genre || format || search) && (
            <button
              onClick={() => {
                updateFilters('genre', '');
                updateFilters('format', '');
                updateFilters('search', '');
              }}
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
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-[#2C3E50] text-white rounded-lg text-sm hover:bg-[#1A2A3A] transition-colors"
            >
              Retry
            </button>
          </div>
        )}
        
        <BookGrid books={books} isLoading={isLoading || genresLoading} />
        
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-10">
            <BookPagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
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
    <Suspense fallback={
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-12 h-12 border-4 border-[#2C3E50] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-[#4A5568] mt-4">Loading marketplace...</p>
        </div>
      </div>
    }>
      <MarketPageContent />
    </Suspense>
  );
}