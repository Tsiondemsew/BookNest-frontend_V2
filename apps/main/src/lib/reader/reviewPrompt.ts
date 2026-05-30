const PROMPTED_KEY = (bookId: string) => `booknest_review_prompted_${bookId}`;
const SUBMITTED_KEY = (bookId: string) => `booknest_review_submitted_${bookId}`;
const PENDING_KEY = 'booknest_pending_review';

export type PendingReview = {
  bookId: string;
  bookTitle: string;
};

export function markBookCompletedSession(bookId: string) {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(`booknest_completed_session_${bookId}`, '1');
}

export function wasCompletedThisSession(bookId: string): boolean {
  if (typeof sessionStorage === 'undefined') return false;
  return sessionStorage.getItem(`booknest_completed_session_${bookId}`) === '1';
}

export function clearCompletedSession(bookId: string) {
  sessionStorage.removeItem(`booknest_completed_session_${bookId}`);
}

export function wasReviewPromptShown(bookId: string): boolean {
  if (typeof localStorage === 'undefined') return true;
  return localStorage.getItem(PROMPTED_KEY(bookId)) === '1';
}

export function markReviewPromptShown(bookId: string) {
  localStorage.setItem(PROMPTED_KEY(bookId), '1');
  clearCompletedSession(bookId);
}

export function markBookReviewSubmitted(bookId: string) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(SUBMITTED_KEY(bookId), '1');
  markReviewPromptShown(bookId);
}

export function hasSubmittedReviewLocally(bookId: string): boolean {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem(SUBMITTED_KEY(bookId)) === '1';
}

export function queuePendingReview(pending: PendingReview) {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending));
}

export function consumePendingReview(): PendingReview | null {
  if (typeof sessionStorage === 'undefined') return null;
  const raw = sessionStorage.getItem(PENDING_KEY);
  sessionStorage.removeItem(PENDING_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingReview;
  } catch {
    return null;
  }
}

/** Call when leaving reader after finishing — queues one-time prompt for library */
export function handleReaderExitReview(bookId: string, bookTitle: string, completed: boolean) {
  if (!completed) return;
  if (wasReviewPromptShown(bookId) || hasSubmittedReviewLocally(bookId)) return;
  markBookCompletedSession(bookId);
  queuePendingReview({ bookId, bookTitle });
}
