'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star, CheckCircle2 } from 'lucide-react';
import { reviewsApi } from '@/lib/api/client';
import { markBookReviewSubmitted } from '@/lib/reader/reviewPrompt';

interface LibraryReviewButtonProps {
  bookId: string;
  bookTitle: string;
  onReviewClick: (bookId: string, bookTitle: string) => void;
  className?: string;
  iconOnly?: boolean;
}

export function LibraryReviewButton({
  bookId,
  bookTitle,
  onReviewClick,
  className = '',
  iconOnly = false,
}: LibraryReviewButtonProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['reviews', 'can', bookId],
    queryFn: () => reviewsApi.canReview(bookId),
    staleTime: 60_000,
  });

  const existingReview = data?.data?.existing_review;
  const canReview = data?.data?.can_review === true;

  useEffect(() => {
    if (existingReview) markBookReviewSubmitted(bookId);
  }, [bookId, existingReview]);

  if (isLoading) return null;

  if (existingReview) {
    if (iconOnly) {
      return (
        <span
          className={`inline-flex items-center justify-center w-9 h-9 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 ${className}`}
          title="You already reviewed this book"
        >
          <CheckCircle2 size={16} />
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center gap-1 text-xs font-medium text-emerald-700 ${className}`}
        title="You already reviewed this book"
      >
        <CheckCircle2 size={12} />
        Reviewed
      </span>
    );
  }

  if (!canReview) return null;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onReviewClick(bookId, bookTitle);
      }}
      className={className}
      title="Write a review"
      aria-label={`Review ${bookTitle}`}
    >
      {iconOnly ? (
        <Star size={16} className="fill-current" />
      ) : (
        <>
          <Star size={12} className="fill-current" />
          Rate book
        </>
      )}
    </button>
  );
}
