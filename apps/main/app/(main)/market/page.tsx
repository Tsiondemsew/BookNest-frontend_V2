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
    
    // Update state
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Marketplace</h1>
      
      <BookFilters
        genres={genres || []}
        selectedGenre={genre}
        selectedFormat={format}
        onGenreChange={(value) => updateFilters('genre', value)}
        onFormatChange={(value) => updateFilters('format', value)}
        onSearchChange={(value) => updateFilters('search', value)}
      />
      
      {isError && (
        <div className="text-center py-12">
          <p className="text-red-500">Failed to load books. Please try again.</p>
        </div>
      )}
      
      <BookGrid books={books} isLoading={isLoading || genresLoading} />
      
      {pagination && pagination.totalPages > 1 && (
        <BookPagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

export default function MarketPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MarketPageContent />
    </Suspense>
  );
}