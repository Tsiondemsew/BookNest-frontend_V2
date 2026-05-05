'use client';

import Link from 'next/link';
import { Trash2, BookOpen, Headphones } from 'lucide-react';
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
    <div className="flex gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      {/* Book Cover */}
      <Link href={`/market/${book.id}`} className="flex-shrink-0">
        <div className="w-24 h-32 rounded-md overflow-hidden bg-gray-100">
          <img
            src={book.cover_image_url}
            alt={book.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>

      {/* Book Info */}
      <div className="flex-1 min-w-0">
        <Link href={`/market/${book.id}`}>
          <h3 className="font-semibold text-lg hover:text-blue-600 transition-colors line-clamp-1">
            {book.title}
          </h3>
        </Link>
        <p className="text-sm text-gray-600 mt-1">{book.author_name}</p>
        
        {/* Formats */}
        <div className="flex items-center gap-3 mt-2">
          {hasPdf && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <BookOpen size={14} />
              PDF
            </span>
          )}
          {hasAudio && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Headphones size={14} />
              Audio
            </span>
          )}
        </div>

        {/* Price */}
        {minPrice > 0 && (
          <p className="text-lg font-bold text-gray-900 mt-2">
            From {minPrice} ETB
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 mt-3">
          <Link
            href={`/market/${book.id}`}
            className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            View Details
          </Link>
          <button
            onClick={handleRemove}
            disabled={isPending}
            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
            aria-label="Remove from wishlist"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Quick Remove Button */}
      <div className="flex-shrink-0">
        <WishlistButton bookId={book.id} size="sm" />
      </div>
    </div>
  );
}