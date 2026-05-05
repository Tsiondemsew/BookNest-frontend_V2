'use client';

import Link from 'next/link';
import type { Book } from '@repo/types';
import { WishlistButton } from '@/features/wishlist/components/WishlistButton';
import { AddToCartButton } from '@/features/cart/components/AddToCartButton';

interface BookCardProps {
  book: Book;
  showWishlistButton?: boolean;
  showQuickAdd?: boolean;
}

export function BookCard({ book, showWishlistButton = true, showQuickAdd = true }: BookCardProps) {
  const hasPdf = book.formats?.some(f => f.format_type === 'PDF');
  const hasAudio = book.formats?.some(f => f.format_type === 'Audio');
  const minPrice = book.formats?.length 
    ? Math.min(...book.formats.map(f => f.price))
    : 0;
  const priceDisplay = minPrice > 0 ? `From ${minPrice} ETB` : 'Free';
  
  // Get the cheapest format ID for quick add
  const cheapestFormat = book.formats?.reduce((min, f) => f.price < min.price ? f : min, book.formats[0]);

  return (
    <div className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link href={`/market/${book.id}`} className="block">
        <div className="aspect-[2/3] relative">
          <img
            src={book.cover_image_url}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg line-clamp-1">{book.title}</h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-1">{book.author_name}</p>
          <div className="flex items-center gap-2 mt-2">
            {hasPdf && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">PDF</span>}
            {hasAudio && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Audio</span>}
          </div>
          <p className="text-sm font-medium text-gray-900 mt-2">{priceDisplay}</p>
        </div>
      </Link>
      
      {/* Wishlist Button */}
      {showWishlistButton && (
        <div className="absolute top-2 right-2">
          <WishlistButton bookId={book.id} size="sm" />
        </div>
      )}
      
      {/* Quick Add to Cart Button
      {showQuickAdd && cheapestFormat && (
        <div className="absolute bottom-2 left-2 right-2">
          <AddToCartButton
            bookFormatId={cheapestFormat.id}
            formatType={cheapestFormat.format_type}
            price={cheapestFormat.price}
            variant="small"
          />
        </div>
      )} */}
    </div>
  );
}