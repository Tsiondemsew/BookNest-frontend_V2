'use client';

import Link from 'next/link';
import { Trash2, BookOpen, Headphones, Heart } from 'lucide-react';
import type { WishlistItem } from '@repo/types';
import { WishlistButton } from './WishlistButton';
import { useRemoveFromWishlist } from '../hooks/useWishlist';

interface WishlistItemProps {
  item: WishlistItem;
}

export function WishlistItemComponent({ item }: WishlistItemProps) {
  const { mutate: removeFromWishlist, isPending } = useRemoveFromWishlist();
  const book = item.book;
  
  if (!book) return null;

  const hasPdf = book.formats?.some(f => f.format_type === 'PDF');
  const hasAudio = book.formats?.some(f => f.format_type === 'Audio');
  const minPrice = book.formats?.length 
    ? Math.min(...book.formats.map(f => f.price))
    : 0;

  const handleRemove = () => {
    removeFromWishlist(book.id);
  };

  return (
    <div className="relative flex md:flex-row flex-col gap-5 p-5 bg-white rounded-xl border border-[#E8E2D9] shadow-sm hover:shadow-md transition-all duration-300 group">
      {/* Book Cover */}
      <Link href={`/market/${book.id}`} className="flex-shrink-0">
        <div className="w-24 h-32 rounded-lg overflow-hidden bg-[#F5F1EB] shadow-sm">
          <img
            src={book.cover_image_url}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>

      {/* Book Info */}
      <div className="flex-1 min-w-0">
        <Link href={`/market/${book.id}`}>
          <h3 className="font-semibold text-[#1A2A3A] text-lg hover:text-[#B85C38] transition-colors line-clamp-1">
            {book.title}
          </h3>
        </Link>
        <p className="text-sm text-[#4A5568] mt-1">{book.author_name}</p>
        
        {/* Rating */}
        <div className="flex items-center gap-1 mt-2">
          <span className="text-[#B85C38] text-sm">★</span>
          <span className="text-sm text-[#4A5568]">{book.avg_rating || '4.5'}</span>
          <span className="text-xs text-[#4A5568]">({book.review_count || 0})</span>
        </div>
        
        {/* Formats */}
        <div className="flex items-center gap-3 mt-3">
          {hasPdf && (
            <span className="inline-flex items-center gap-1 text-xs bg-[#F5F1EB] text-[#4A5568] px-2 py-1 rounded-md">
              <BookOpen size={12} />
              PDF
            </span>
          )}
          {hasAudio && (
            <span className="inline-flex items-center gap-1 text-xs bg-[#F5F1EB] text-[#4A5568] px-2 py-1 rounded-md">
              <Headphones size={12} />
              Audio
            </span>
          )}
        </div>
<div className='flex md:flex-row flex-col justify-between md:items-center'>
        {/* Price */}
        {minPrice > 0 && (
          <p className="text-lg font-bold text-[#2C3E50] mt-3">
            From {minPrice} ETB
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 mt-4">
          <Link
            href={`/market/${book.id}`}
            className="px-4 py-1.5 bg-[#2C3E50] text-white text-sm rounded-lg font-medium hover:bg-[#1A2A3A] transition-colors shadow-sm"
          >
            View Details
          </Link>
        </div>
        </div>
      </div>

      {/* Quick Wishlist Button */}
      <div className="flex-shrink-0 absolute top-5 right-5">
        <WishlistButton bookId={book.id} size="sm" />
      </div>
    </div>
  );
}