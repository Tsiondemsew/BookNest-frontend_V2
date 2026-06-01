import { getApiErrorMessage } from '@/lib/api-error';
import type { PendingBook } from './types';

function normalizeBookStatus(status: string | undefined): string {
  if (!status) return '';
  return status.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
}

export function isBookModeratable(status: string | undefined): boolean {
  const normalized = normalizeBookStatus(status);
  return ['pending_review', 'pending', 'rejected', 'changes_requested'].includes(normalized);
}

/** Per-change approve/reject on the change-details page */
export function canModerateChangeItems(book: PendingBook): boolean {
  if (isBookModeratable(book.status)) return true;
  const isUpdate =
    book.type === 'UPDATE' ||
    book.submissionType === 'metadata_update' ||
    Boolean(book.previous && book.proposed) ||
    Boolean(book.updateRequest);
  const status = normalizeBookStatus(book.status);
  if (isUpdate && ['pending_review', 'changes_requested', 'pending'].includes(status)) {
    return true;
  }
  if (status === 'pending_review') return true;
  return false;
}

export async function approveBookWithChanges(bookId: string) {
  const res = await fetch(`/api/admin/books/${bookId}/approve`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      skipValidation: true,
      approveChanges: true,
      skipContent: true,
    }),
  });
  const payload = await res.json();
  if (!res.ok || !payload.success) {
    throw new Error(getApiErrorMessage(payload, 'Failed to approve book'));
  }
  return payload;
}

export async function rejectBookSubmission(
  bookId: string,
  body: {
    reason: string;
    adminNotes?: string;
    suggestedFixes?: string;
    severity?: string;
  },
) {
  const res = await fetch(`/api/admin/books/${bookId}/reject`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, notify: true }),
  });
  const payload = await res.json();
  if (!res.ok || !payload.success) {
    throw new Error(getApiErrorMessage(payload, 'Failed to reject book'));
  }
  return payload;
}

export function optimisticApprovedBook(book: PendingBook): PendingBook {
  return {
    ...book,
    status: 'approved',
    reviewState: book.reviewState
      ? {
          ...book.reviewState,
          changeDecisions: Object.fromEntries(
            Object.keys(book.reviewState.changeDecisions || {}).map((k) => [k, 'approved' as const]),
          ),
        }
      : book.reviewState,
  };
}
