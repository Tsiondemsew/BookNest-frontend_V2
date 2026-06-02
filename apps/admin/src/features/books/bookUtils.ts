import type { AdminBookRow } from '@repo/api-client';

export function bookStatusTone(
  status: string
): 'neutral' | 'success' | 'warning' | 'danger' {
  if (status === 'approved') return 'success';
  if (status === 'pending_review') return 'warning';
  if (status === 'rejected') return 'danger';
  return 'neutral';
}

export function formatBookStatus(status: string) {
  return status.replace(/_/g, ' ');
}

export function minBookPrice(book: AdminBookRow) {
  if (!book.formats?.length) return null;
  return Math.min(...book.formats.map((f) => Number(f.price) || 0));
}

export const BOOK_STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'pending_review', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
] as const;
