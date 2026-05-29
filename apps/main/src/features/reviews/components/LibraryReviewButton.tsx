'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { BookReviewModal } from './BookReviewModal';

interface LibraryReviewButtonProps {
  bookId: string;
  bookTitle: string;
  className?: string;
}

export function LibraryReviewButton({ bookId, bookTitle, className = '' }: LibraryReviewButtonProps) {
  const [open, setOpen] = useState(false);

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
