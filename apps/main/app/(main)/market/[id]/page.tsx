'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useBook } from '@/features/books/hooks/useBooks';
import { AddToCartButton } from '@/features/cart/components/AddToCartButton';
import type { BookFormat } from '@repo/types';
import { Suspense } from 'react';

export default function BookDetailPage() {
  const params = useParams();
  const bookId = params.id as string;
  const { data: book, isLoading, isError } = useBook(bookId);

  if (isLoading) {
    return (
      
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3">
              <div className="aspect-[2/3] bg-gray-200 rounded-lg"></div>
            </div>
            <div className="w-full md:w-2/3 space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !book) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Book Not Found</h1>
        <p className="text-gray-600 mt-2">The book you're looking for doesn't exist or has been removed.</p>
        <Link href="/market" className="inline-block mt-4 text-blue-600 hover:underline">
          ← Back to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <Suspense>
    <div className="container mx-auto px-4 py-8">
      <Link href="/market" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Back to Marketplace
      </Link>
      
      <div className="flex flex-col md:flex-row gap-8 mt-4">
        {/* Cover Image */}
        <div className="w-full md:w-1/3">
          <img
            src={book.cover_image_url}
            alt={book.title}
            className="w-full rounded-lg shadow-lg"
          />
        </div>
        
        {/* Book Details */}
        <div className="w-full md:w-2/3">
          <h1 className="text-3xl md:text-4xl font-bold">{book.title}</h1>
          {book.subtitle && (
            <h2 className="text-xl text-gray-600 mt-1">{book.subtitle}</h2>
          )}
          
          <p className="text-gray-700 mt-2">
            By <span className="font-medium">{book.author_name}</span>
          </p>
          {book.publisher_name && (
            <p className="text-gray-500 text-sm">
              Published by {book.publisher_name}
            </p>
          )}
          
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              {book.genre?.name || 'General'}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              {book.language}
            </span>
            {book.publication_date && (
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {new Date(book.publication_date).getFullYear()}
              </span>
            )}
          </div>
          
          {book.description && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{book.description}</p>
            </div>
          )}
          
          {/* Formats & Purchase Options */}
<div className="mt-8">
  <h3 className="text-lg font-semibold mb-4">Available Formats</h3>
  <div className="space-y-3">
    {book.formats?.map((format: BookFormat) => (
      <div
        key={format.format_type}
        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
      >
        <div>
          <span className="font-medium">
            {format.format_type === 'PDF' ? '📖 eBook (PDF)' : '🎧 Audiobook'}
          </span>
          {format.format_type === 'PDF' && format.page_count && (
            <p className="text-sm text-gray-500">{format.page_count} pages</p>
          )}
          {format.format_type === 'Audio' && format.duration_sec && (
            <p className="text-sm text-gray-500">
              {Math.floor(format.duration_sec / 3600)}h {Math.floor((format.duration_sec % 3600) / 60)}m
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-gray-900">
            {format.price} {format.currency || 'ETB'}
          </p>
          <div className="flex gap-2 mt-2">
            <AddToCartButton
  bookFormatId={format.id}
  formatType={format.format_type}
  price={format.price}
  variant="outline"
/>
<AddToCartButton
  bookFormatId={format.id}
  formatType={format.format_type}
  price={format.price}
  variant="buy-now"
/>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>
        </div>
      </div>
    </div>
    </Suspense>
  );
}