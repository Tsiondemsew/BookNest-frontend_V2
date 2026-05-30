'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star, CheckCircle2 } from 'lucide-react';
import { reviewsApi } from '@/lib/api/client';
import { markBookReviewSubmitted } from '@/lib/reader/reviewPrompt';
import { BookReviewModal } from './BookReviewModal';

interface LibraryReviewButtonProps {
  bookId: string;
  bookTitle: string;
  className?: string;
}

export function LibraryReviewButton({ bookId, bookTitle, className = '' }: LibraryReviewButtonProps) {
  const [open, setOpen] = useState(false);

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

  if (existingReview || !canReview) {
    if (existingReview) {
      return (
        <span
          className={`inline-flex items-center gap-1 text-xs font-medium text-[#2D6A4F] ${className}`}
          title="You already reviewed this book"
        >
          <CheckCircle2 size={12} />
          Reviewed
        </span>
      );
    }
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className={`inline-flex items-center gap-1 text-xs font-medium text-[#B85C38] hover:text-[#8E735B] ${className}`}
      >
        <Star size={12} className="fill-current" />
        Rate book
      </button>
      {open && (
        <BookReviewModal
          bookId={bookId}
          bookTitle={bookTitle}
          onClose={() => setOpen(false)}
          onSubmitted={() => setOpen(false)}
        />
      )}
    </>
  );
}
