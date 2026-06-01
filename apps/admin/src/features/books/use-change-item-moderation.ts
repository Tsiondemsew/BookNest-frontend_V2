'use client';

import { useCallback, useState } from 'react';
import { getApiErrorMessage } from '@/lib/api-error';
import type { ChangeDecisionStatus, PendingBook, ReviewState } from './types';

function mapContentStatus(status?: string): ChangeDecisionStatus {
  if (status === 'approved') return 'approved';
  if (status === 'rejected') return 'rejected';
  return 'pending';
}

const EMPTY_REVIEW_STATE: ReviewState = {
  checklist: {},
  pdfReview: { status: 'pending', comment: null, reviewedAt: null, reviewedBy: null },
  audioReview: { status: 'pending', comment: null, reviewedAt: null, reviewedBy: null },
  changeDecisions: {},
};

function baseReviewState(book: PendingBook): ReviewState {
  return {
    ...EMPTY_REVIEW_STATE,
    ...book.reviewState,
    checklist: { ...EMPTY_REVIEW_STATE.checklist, ...book.reviewState?.checklist },
    pdfReview: { ...EMPTY_REVIEW_STATE.pdfReview, ...book.reviewState?.pdfReview },
    audioReview: { ...EMPTY_REVIEW_STATE.audioReview, ...book.reviewState?.audioReview },
    changeDecisions: { ...book.reviewState?.changeDecisions },
  };
}

function mergeReviewStateFromPayload(
  payload: { success?: boolean; data?: { reviewState?: ReviewState } },
  fallback: ReviewState,
  changedKey?: string,
): ReviewState {
  const fromApi =
    payload?.data?.reviewState ??
    (payload as { reviewState?: ReviewState }).reviewState;
  if (!fromApi || typeof fromApi !== 'object') return fallback;
  return {
    ...fallback,
    ...fromApi,
    checklist: { ...fallback.checklist, ...fromApi.checklist },
    pdfReview: { ...fallback.pdfReview, ...fromApi.pdfReview },
    audioReview: { ...fallback.audioReview, ...fromApi.audioReview },
    changeDecisions: { ...fallback.changeDecisions, ...fromApi.changeDecisions },
  };
}

export function getChangeItemStatus(
  reviewState: ReviewState | undefined,
  changeId: string,
): ChangeDecisionStatus {
  if (!reviewState) return 'pending';
  if (changeId === 'content_pdf') {
    return mapContentStatus(reviewState.pdfReview?.status);
  }
  if (changeId === 'content_audio') {
    return mapContentStatus(reviewState.audioReview?.status);
  }
  if (changeId === 'cover_image_url' || changeId === 'cover') {
    return (
      reviewState.changeDecisions?.cover_image_url ||
      reviewState.changeDecisions?.cover ||
      'pending'
    );
  }
  return reviewState.changeDecisions?.[changeId] || 'pending';
}

async function persistFieldDecision(
  book: PendingBook,
  changeId: string,
  decision: 'approved' | 'rejected',
): Promise<ReviewState> {
  const prior = baseReviewState(book);
  const optimistic: ReviewState = {
    ...prior,
    changeDecisions: {
      ...prior.changeDecisions,
      [changeId]: decision,
    },
  };

  const res = await fetch(`/api/admin/books/${book.id}/review-state`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      changeDecisions: { [changeId]: decision },
    }),
  });
  const payload = await res.json();
  if (!res.ok || !payload.success) {
    throw new Error(getApiErrorMessage(payload, 'Failed to save decision'));
  }
  return mergeReviewStateFromPayload(payload, optimistic, changeId);
}

async function persistContentDecision(
  book: PendingBook,
  target: 'pdf' | 'audio',
  decision: 'approved' | 'rejected',
): Promise<ReviewState> {
  const prior = baseReviewState(book);
  const reviewKey = target === 'pdf' ? 'pdfReview' : 'audioReview';
  const optimistic: ReviewState = {
    ...prior,
    [reviewKey]: {
      ...prior[reviewKey],
      status: decision,
      reviewedAt: new Date().toISOString(),
    },
  };

  const res = await fetch(`/api/admin/books/${book.id}/content-review`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target, status: decision }),
  });
  const payload = await res.json();
  if (!res.ok || !payload.success) {
    throw new Error(getApiErrorMessage(payload, 'Failed to update content review'));
  }
  const changedKey = target === 'pdf' ? 'content_pdf' : 'content_audio';
  return mergeReviewStateFromPayload(payload, optimistic, changedKey);
}

export async function approveChangeItem(
  book: PendingBook,
  changeId: string,
): Promise<ReviewState> {
  if (changeId === 'content_pdf') {
    return persistContentDecision(book, 'pdf', 'approved');
  }
  if (changeId === 'content_audio') {
    return persistContentDecision(book, 'audio', 'approved');
  }
  return persistFieldDecision(book, changeId, 'approved');
}

export async function rejectChangeItem(
  book: PendingBook,
  changeId: string,
): Promise<ReviewState> {
  if (changeId === 'content_pdf') {
    return persistContentDecision(book, 'pdf', 'rejected');
  }
  if (changeId === 'content_audio') {
    return persistContentDecision(book, 'audio', 'rejected');
  }
  return persistFieldDecision(book, changeId, 'rejected');
}

export function useChangeItemModeration(
  book: PendingBook | null,
  onReviewStateUpdated?: (reviewState: PendingBook['reviewState']) => void,
) {
  const [actingItemId, setActingItemId] = useState<string | null>(null);

  const getItemStatus = useCallback(
    (changeId: string) => getChangeItemStatus(book?.reviewState, changeId),
    [book?.reviewState],
  );

  const runItemAction = useCallback(
    async (changeId: string, action: 'approve' | 'reject') => {
      if (!book) return;
      setActingItemId(changeId);
      try {
        const next =
          action === 'approve'
            ? await approveChangeItem(book, changeId)
            : await rejectChangeItem(book, changeId);
        onReviewStateUpdated?.(next);
      } catch (err) {
        throw err;
      } finally {
        setActingItemId(null);
      }
    },
    [book, onReviewStateUpdated],
  );

  const onItemApprove = useCallback(
    (changeId: string) => runItemAction(changeId, 'approve'),
    [runItemAction],
  );

  const onItemReject = useCallback(
    (changeId: string) => runItemAction(changeId, 'reject'),
    [runItemAction],
  );

  return {
    actingItemId,
    getItemStatus,
    onItemApprove,
    onItemReject,
  };
}
