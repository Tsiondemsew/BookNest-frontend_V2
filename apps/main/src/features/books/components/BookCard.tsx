'use client';

import Link from 'next/link';
import { BookOpen, Headphones, Star } from 'lucide-react';
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

function formatPrice(price: number) {
  return `${price.toLocaleString()} ETB`;
}

export function BookCard({ book, showWishlistButton = true, showQuickAdd = true }: BookCardProps) {
  const { isAuthenticated } = useAuthStore();
  const { isOwnBook, ownedFormatIds } = useBookPurchaseStatus(book.id);

  const formats = book.formats ?? [];
  const hasPdf = formats.some((f) => f.format_type === 'PDF');
  const hasAudio = formats.some((f) => f.format_type === 'Audio');
  const minPrice = formats.length ? Math.min(...formats.map((f) => f.price)) : 0;

  const cheapestFormat = formats.reduce(
    (min, f) => (f.price < min.price ? f : min),
    formats[0]
  );

  const cheapestOwned = cheapestFormat ? ownedFormatIds.includes(cheapestFormat.id) : false;
  const hideQuickAdd =
    !showQuickAdd || !cheapestFormat || (isAuthenticated && (isOwnBook || cheapestOwned));

  const rating = book.avg_rating ?? 0;
  const reviewCount = book.review_count ?? 0;
  const hasRating = reviewCount > 0 && rating > 0;

  return (
    <article className="group relative flex flex-col h-full bg-white rounded-2xl border border-[#E8E2D9] shadow-sm hover:shadow-md hover:border-[#B85C38]/25 transition-all duration-200">
      <Link href={`/market/${book.id}`} className="block relative">
        <div className="aspect-[2/3] relative overflow-hidden rounded-t-2xl bg-[#F5F1EB]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={book.cover_image_url}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          />
          <div className="absolute inset-x-0 top-0 p-2.5 flex flex-wrap gap-1 pointer-events-none">
            {hasPdf && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wide bg-white/95 backdrop-blur-sm text-[#2C3E50] px-2 py-0.5 rounded-md shadow-sm">
                <BookOpen size={10} />
                PDF
              </span>
            )}
            {hasAudio && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wide bg-white/95 backdrop-blur-sm text-[#2C3E50] px-2 py-0.5 rounded-md shadow-sm">
                <Headphones size={10} />
                Audio
              </span>
            )}
          </div>
          {minPrice > 0 && (
            <div className="absolute bottom-0 inset-x-0 p-2.5 pointer-events-none">
              <span className="inline-block text-[10px] font-bold bg-[#2C3E50]/95 text-white px-2 py-1 rounded-md shadow-sm tabular-nums">
                from {formatPrice(minPrice)}
              </span>
            </div>
          )}
        </div>
      </Link>

      {showWishlistButton && (
        <div className="absolute top-3 right-3 z-10">
          <WishlistButton bookId={book.id} size="sm" className="shadow-sm backdrop-blur-sm bg-white/95" />
        </div>
      )}

      <div className="flex flex-col flex-1 p-4">
        <Link href={`/market/${book.id}`} className="block min-w-0">
          <h3 className="font-semibold text-[#1A2A3A] text-sm sm:text-base line-clamp-2 leading-snug group-hover:text-[#B85C38] transition-colors bn-serif">
            {book.title}
          </h3>
          <p className="text-xs sm:text-sm text-[#4A5568] mt-1 line-clamp-1">{book.author_name}</p>
        </Link>

        <div className="flex items-center gap-2 mt-2 min-h-[1.25rem]">
          {hasRating ? (
            <>
              <div className="inline-flex items-center gap-0.5">
                <Star size={13} className="fill-[#B85C38] text-[#B85C38]" />
                <span className="text-xs font-semibold text-[#1A2A3A] tabular-nums">
                  {rating.toFixed(1)}
                </span>
              </div>
              <span className="text-[#D4CCC0] text-xs">·</span>
              <span className="text-xs text-[#4A5568]">
                {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
              </span>
            </>
          ) : (
            <span className="text-xs text-[#4A5568]/80">No reviews yet</span>
          )}
        </div>

        <div className="mt-auto pt-4">
          {isOwnBook ? (
            <span className="block w-full py-2.5 rounded-xl bg-[#F5F1EB] text-center text-xs font-medium text-[#4A5568]">
              Your book
            </span>
          ) : cheapestOwned ? (
            <Link
              href={`/reader/${book.id}${cheapestFormat ? `?format_id=${cheapestFormat.id}` : ''}`}
              className="block w-full py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center text-xs sm:text-sm font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
            >
              Open in library
            </Link>
          ) : hideQuickAdd || !cheapestFormat ? (
            <Link
              href={`/market/${book.id}`}
              className="block w-full py-2.5 rounded-xl bg-[#2C3E50] text-white text-center text-xs sm:text-sm font-semibold hover:bg-[#1A2A3A] transition-colors"
            >
              View details
            </Link>
          ) : (
            <AddToCartButton
              bookId={book.id}
              bookFormatId={cheapestFormat.id}
              formatType={cheapestFormat.format_type}
              price={cheapestFormat.price}
              variant="small"
              isOwned={cheapestOwned}
              isOwnBook={isOwnBook}
            />
          )}
        </div>
      </div>
    </article>
  );
}
