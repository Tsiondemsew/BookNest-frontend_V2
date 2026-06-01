'use client';

import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { useToast } from '@/components/toast-provider';
import { authorNotificationToast } from '@/lib/author-notification-toast';
import { buildOptimisticReviewState } from '@/features/books/change-review-progress';
import {
  approveBookWithChanges,
  isBookModeratable,
  optimisticApprovedBook,
} from '@/features/books/change-moderation-api';
import {
  approveChangeItem,
  rejectChangeItem,
} from '@/features/books/use-change-item-moderation';
import type { PendingBook, ReviewState } from '@/features/books/types';

function snapshotReviewState(book: PendingBook): ReviewState {
  const rs = book.reviewState;
  return {
    checklist: { ...(rs?.checklist ?? {}) },
    changeDecisions: { ...(rs?.changeDecisions ?? {}) },
    pdfReview: rs?.pdfReview ?? {
      status: 'pending',
      comment: null,
      reviewedAt: null,
      reviewedBy: null,
    },
    audioReview: rs?.audioReview ?? {
      status: 'pending',
      comment: null,
      reviewedAt: null,
      reviewedBy: null,
    },
  };
}

export type ChangeItemAction = 'approve' | 'reject' | null;

export function useChangeDetailModeration(
  book: PendingBook | null,
  onBookUpdated: Dispatch<SetStateAction<PendingBook | null>>,
  onItemReload: () => Promise<void>,
  onBookReload?: () => Promise<void>,
) {
  const reloadAfterBookAction = onBookReload ?? onItemReload;
  const { toast } = useToast();
  const [bookBusy, setBookBusy] = useState(false);
  const [activeChangeId, setActiveChangeId] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<ChangeItemAction>(null);

  const canInteract = book ? isBookModeratable(book.status) : false;
  const bookRef = useRef(book);

  useEffect(() => {
    bookRef.current = book;
  }, [book]);

  const applyReviewState = useCallback(
    (reviewState: ReviewState) => {
      onBookUpdated((prev) => (prev ? { ...prev, reviewState } : prev));
    },
    [onBookUpdated],
  );

  const runItemDecision = useCallback(
    async (changeId: string, action: 'approve' | 'reject') => {
      const current = bookRef.current;
      if (!current) return;
      if (current.status === 'archived') {
        toast('Archived books cannot be moderated.', 'error');
        return;
      }

      const decision = action === 'approve' ? 'approved' : 'rejected';
      const priorState = snapshotReviewState(current);
      const optimistic = buildOptimisticReviewState(current, changeId, decision);

      setActiveChangeId(changeId);
      setActiveAction(action);
      applyReviewState(optimistic);
      bookRef.current = { ...current, reviewState: optimistic };

      try {
        const next =
          action === 'approve'
            ? await approveChangeItem(bookRef.current, changeId)
            : await rejectChangeItem(bookRef.current, changeId);
        applyReviewState(next);
        bookRef.current = { ...current, reviewState: next };
        onBookUpdated((prev) => (prev ? { ...prev, reviewState: next } : prev));
        toast(action === 'approve' ? 'Change approved' : 'Change rejected', 'success');
      } catch (err) {
        applyReviewState(priorState);
        bookRef.current = { ...current, reviewState: priorState };
        toast(
          err instanceof Error
            ? err.message
            : action === 'approve'
              ? 'Failed to approve'
              : 'Failed to reject',
          'error',
        );
        throw err;
      } finally {
        setActiveChangeId(null);
        setActiveAction(null);
      }
    },
    [applyReviewState, onBookUpdated, toast],
  );

  const onItemApprove = useCallback(
    (changeId: string) => runItemDecision(changeId, 'approve'),
    [runItemDecision],
  );

  const onItemReject = useCallback(
    (changeId: string) => runItemDecision(changeId, 'reject'),
    [runItemDecision],
  );

  const approveBook = useCallback(async () => {
    if (!book) return;
    setBookBusy(true);
    try {
      const payload = await approveBookWithChanges(book.id);
      onBookUpdated(optimisticApprovedBook(book));
      const { message, variant } = authorNotificationToast(
        book.title,
        'approved',
        payload?.data?.authorNotification,
      );
      toast(message, variant);
      await reloadAfterBookAction();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to approve book', 'error');
      throw err;
    } finally {
      setBookBusy(false);
    }
  }, [book, onBookUpdated, reloadAfterBookAction, toast]);

  const isItemApproving = useCallback(
    (changeId: string) => activeChangeId === changeId && activeAction === 'approve',
    [activeAction, activeChangeId],
  );

  const isItemRejecting = useCallback(
    (changeId: string) => activeChangeId === changeId && activeAction === 'reject',
    [activeAction, activeChangeId],
  );

  return {
    bookBusy,
    activeChangeId,
    activeAction,
    canInteract,
    approveBook,
    onItemApprove,
    onItemReject,
    isItemApproving,
    isItemRejecting,
  };
}
