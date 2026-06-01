import type { PendingBook, QueueStatus } from '@/features/books/types';

const styles: Record<string, string> = {
  NEW: 'bg-surface0/15 text-violet-700 ring-violet-500/25 dark:text-violet-300',
  UPDATE: 'bg-blue-500/15 text-blue-700 ring-blue-500/25 dark:text-blue-300',
  RESUBMITTED: 'bg-amber-500/15 text-amber-800 ring-amber-500/25 dark:text-amber-300',
  pending_review: 'bg-amber-500/15 text-amber-800 ring-amber-500/25',
  approved: 'bg-emerald-500/15 text-emerald-700 ring-emerald-500/25',
  rejected: 'bg-red-500/15 text-red-700 ring-red-500/25',
};

export function StatusBadge({ book, queueStatus }: { book: PendingBook; queueStatus: QueueStatus }) {
  let label = book.type;
  let key = book.type;

  if (book.isResubmitted && book.status === 'pending_review') {
    label = 'SUBMITTED';
    key = 'RESUBMITTED';
  } else if (book.type === 'NEW' || book.type === 'UPDATE') {
    key = book.type;
  } else {
    key = book.status;
    label = book.status.replace('_', ' ');
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${styles[key] || styles.pending_review}`}
    >
      {label}
    </span>
  );
}
