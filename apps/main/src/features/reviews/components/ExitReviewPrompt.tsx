'use client';

import { BookReviewModal } from './BookReviewModal';
import { markReviewPromptShown } from '@/lib/reader/reviewPrompt';
import type { PendingReview } from '@/lib/reader/reviewPrompt';

interface ExitReviewPromptProps {
  pending: PendingReview;
  onDismiss: () => void;
}

export function ExitReviewPrompt({ pending, onDismiss }: ExitReviewPromptProps) {
  return (
    <BookReviewModal
      bookId={pending.bookId}
      bookTitle={pending.bookTitle}
      onClose={() => {
        markReviewPromptShown(pending.bookId);
        onDismiss();
      }}
      onSubmitted={() => {
        markReviewPromptShown(pending.bookId);
        onDismiss();
      }}
    />
  );
}
