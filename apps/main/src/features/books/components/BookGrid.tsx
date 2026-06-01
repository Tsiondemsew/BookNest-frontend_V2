'use client';

import type { Book } from '@repo/types';
import { BookCard } from './BookCard';
import { useTranslation } from '@/hooks/useTranslation';

interface BookGridProps {
  books: Book[];
  isLoading?: boolean;
}

export function BookGrid({ books, isLoading }: BookGridProps) {
  const { t } = useTranslation();
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 min-[400px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl overflow-hidden border border-[#E8E2D9] animate-pulse min-w-0">
            <div className="aspect-[2/3] sm:aspect-[3/4] bg-gradient-to-br from-[#E8E2D9] to-[#D4CCC0]"></div>
            <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
              <div className="h-5 bg-[#E8E2D9] rounded w-3/4"></div>
              <div className="h-4 bg-[#E8E2D9] rounded w-1/2"></div>
              <div className="h-3 bg-[#E8E2D9] rounded w-1/3"></div>
              <div className="h-4 bg-[#E8E2D9] rounded w-1/4 mt-2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-[#E8E2D9]">
        <p className="text-[#4A5568] text-lg">{t('books.noBooksFound')}</p>
        <p className="text-[#A0A0A0] mt-2">{t('books.adjustFilters')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 min-[400px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}