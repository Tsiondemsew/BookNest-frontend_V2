'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useBook } from '@/features/books/hooks/useBooks';
import { BookFormatPurchaseSection } from '@/features/books/components/BookFormatPurchaseSection';
import { BookReviewsList } from '@/features/reviews/components/BookReviewsList';
import { Suspense } from 'react';

function BookDetailContent() {
  const params = useParams();
  const bookId = params.id as string;
  const { data: book, isLoading, isError } = useBook(bookId);
  if (isLoading) {
    return <BookDetailSkeleton />;
  }

  if (isError || !book) {
    return <BookNotFound />;
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <nav className="flex items-center gap-2 text-sm text-[#4A5568]">
          <Link href="/market" className="hover:text-[#B85C38] transition-colors">
            Marketplace
          </Link>
          <span>/</span>
          <span className="text-[#1A2A3A] font-medium line-clamp-1">{book.title}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Book Cover */}
          <div className="lg:w-2/5 xl:w-1/3">
            <div className="sticky top-24">
              <div className="rounded-2xl overflow-hidden shadow-xl bg-white border border-[#E8E2D9]">
                <img
                  src={book.cover_image_url}
                  alt={book.title}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
          
          {/* Book Details */}
          <div className="lg:w-3/5 xl:w-2/3">
            {/* Title Section */}
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-[#1A2A3A] leading-tight">
                {book.title}
              </h1>
              {book.subtitle && (
                <h2 className="text-lg text-[#4A5568] mt-2">{book.subtitle}</h2>
              )}
              
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <p className="text-[#4A5568]">
                  By <span className="font-semibold text-[#1A2A3A]">{book.author_name}</span>
                </p>
                {book.publisher_name && (
                  <>
                    <span className="text-[#E8E2D9]">•</span>
                    <p className="text-sm text-[#4A5568]">
                      Published by {book.publisher_name}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Rating & Stats */}
            <div className="flex flex-wrap items-center gap-6 p-4 bg-white rounded-xl border border-[#E8E2D9] mb-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl text-[#B85C38]">★</span>
                <div>
                  <div className="text-xl font-bold text-[#1A2A3A]">
                    {book.avg_rating ? Number(book.avg_rating).toFixed(1) : '—'}
                  </div>
                  <div className="text-xs text-[#4A5568]">{book.review_count ?? 0} reviews</div>
                </div>
              </div>
              <div className="w-px h-8 bg-[#E8E2D9]"></div>
              <div>
                <div className="text-xl font-bold text-[#1A2A3A]">{book.formats?.length || 1}</div>
                <div className="text-xs text-[#4A5568]">format{book.formats?.length !== 1 ? 's' : ''}</div>
              </div>
            </div>

            {/* Description */}
            {book.description && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-[#1A2A3A] mb-3">About this book</h3>
                <p className="text-[#4A5568] leading-relaxed whitespace-pre-line">
                  {book.description}
                </p>
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              <span className="px-3 py-1.5 bg-white text-[#4A5568] rounded-full text-sm border border-[#E8E2D9]">
                {book.genre?.name || 'General'}
              </span>
              <span className="px-3 py-1.5 bg-white text-[#4A5568] rounded-full text-sm border border-[#E8E2D9]">
                {book.language}
              </span>
              {book.publication_date && (
                <span className="px-3 py-1.5 bg-white text-[#4A5568] rounded-full text-sm border border-[#E8E2D9]">
                  {new Date(book.publication_date).getFullYear()}
                </span>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#1A2A3A] mb-4">
                Available formats
              </h3>
              <BookFormatPurchaseSection
                formats={book.formats || []}
                bookId={book.id}
              />
            </div>

            <div className="mt-10">
              <h3 className="text-lg font-semibold text-[#1A2A3A] mb-4">Reviews</h3>
              <BookReviewsList bookId={book.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Skeleton Component
function BookDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="lg:w-2/5 xl:w-1/3">
            <div className="rounded-2xl overflow-hidden bg-white border border-[#E8E2D9]">
              <div className="aspect-[2/3] bg-gradient-to-br from-[#E8E2D9] to-[#D4CCC0] animate-pulse"></div>
            </div>
          </div>
          <div className="lg:w-3/5 xl:w-2/3 space-y-6">
            <div className="h-10 bg-gradient-to-r from-[#E8E2D9] to-[#D4CCC0] rounded-lg w-3/4 animate-pulse"></div>
            <div className="h-5 bg-gradient-to-r from-[#E8E2D9] to-[#D4CCC0] rounded-lg w-1/2 animate-pulse"></div>
            <div className="h-24 bg-gradient-to-r from-[#E8E2D9] to-[#D4CCC0] rounded-lg w-full animate-pulse"></div>
            <div className="space-y-3">
              <div className="h-20 bg-gradient-to-r from-[#E8E2D9] to-[#D4CCC0] rounded-lg w-full animate-pulse"></div>
              <div className="h-20 bg-gradient-to-r from-[#E8E2D9] to-[#D4CCC0] rounded-lg w-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Not Found Component
function BookNotFound() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">📖</div>
        <h1 className="text-2xl font-bold text-[#1A2A3A] mb-2">Book Not Found</h1>
        <p className="text-[#4A5568] mb-6">
          The book you're looking for doesn't exist or has been removed.
        </p>
        <Link 
          href="/market" 
          className="inline-flex items-center gap-2 text-[#B85C38] hover:text-[#8E735B] transition-colors"
        >
          ← Back to Marketplace
        </Link>
      </div>
    </div>
  );
}

export default function BookDetailPage() {
  return (
    <Suspense fallback={<BookDetailSkeleton />}>
      <BookDetailContent />
    </Suspense>
  );
}