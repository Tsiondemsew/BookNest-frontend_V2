'use client';

import Link from 'next/link';
import type { Book } from '@repo/types';
import { WishlistButton } from '@/features/wishlist/components/WishlistButton';
import { AddToCartButton } from '@/features/cart/components/AddToCartButton';
import { useBookPurchaseStatus } from '@/features/books/hooks/useBookPurchaseStatus';
import { useAuthStore } from '@/stores/authStore';

interface BookCardProps {
  book: Book;
  showWishlistButton?: boolean;
  showQuickAdd?: boolean;
}

export function BookCard({ book, showWishlistButton = true, showQuickAdd = true }: BookCardProps) {
  const { isAuthenticated } = useAuthStore();
  const { isOwnBook, ownedFormatIds } = useBookPurchaseStatus(book.id);

  const hasPdf = book.formats?.some((f) => f.format_type === 'PDF');
  const hasAudio = book.formats?.some((f) => f.format_type === 'Audio');
  const minPrice = book.formats?.length ? Math.min(...book.formats.map((f) => f.price)) : 0;

  const cheapestFormat = book.formats?.reduce(
    (min, f) => (f.price < min.price ? f : min),
    book.formats[0]
  );

  const cheapestOwned = cheapestFormat
    ? ownedFormatIds.includes(cheapestFormat.id)
    : false;
  const hideQuickAdd =
    !showQuickAdd ||
    !cheapestFormat ||
    (isAuthenticated && (isOwnBook || cheapestOwned));

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-[#E8E2D9]">
      <Link href={`/market/${book.id}`} className="block">
        <div className="aspect-[2/3] relative overflow-hidden bg-[#F5F1EB]">
          <img
            src={book.cover_image_url}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
          />
          {/* Format badges - subtle */}
          <div className="absolute bottom-2 left-2 flex gap-1">
            {hasPdf && (
              <span className="px-2 py-0.5 bg-white/90 backdrop-blur-sm text-[#2C3E50] text-xs rounded-md font-medium shadow-sm">
                PDF
              </span>
            )}
            {hasAudio && (
              <span className="px-2 py-0.5 bg-white/90 backdrop-blur-sm text-[#2C3E50] text-xs rounded-md font-medium shadow-sm">
                Audio
              </span>
            )}
          </div>
        </div>
        
        <div className={`p-4 ${!hideQuickAdd ? 'pb-16' : ''}`}>
          <h3 className="font-semibold text-[#1A2A3A] text-base line-clamp-1">
            {book.title}
          </h3>
          <p className="text-sm text-[#4A5568] mt-1 line-clamp-1">
            {book.author_name}
          </p>
          
          {/* Rating row - clean */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center">
              <span className="text-[#B85C38] text-sm">★</span>
              <span className="text-sm text-[#4A5568] ml-0.5">4.5</span>
            </div>
            <span className="text-xs text-[#A0A0A0]">•</span>
            <span className="text-xs text-[#4A5568]">0 reviews</span>
          </div> 
        </div>
      </Link>
      
      {/* Wishlist Button - unchanged position, just restyled */}
      {showWishlistButton && (
        <div className="absolute top-2 right-2">
          <WishlistButton bookId={book.id} size="sm" />
        </div>
      )}
      
      {/* Quick Add to Cart Button - EXACT same logic, just restyled */}
      {!hideQuickAdd && cheapestFormat && (
        <div className="absolute bottom-2 left-2 right-2">
          <AddToCartButton
            bookId={book.id}
            bookFormatId={cheapestFormat.id}
            formatType={cheapestFormat.format_type}
            price={cheapestFormat.price}
            variant="small"
            isOwned={cheapestOwned}
            isOwnBook={isOwnBook}
          />
        </div>
      )}
    </div>
  );
}