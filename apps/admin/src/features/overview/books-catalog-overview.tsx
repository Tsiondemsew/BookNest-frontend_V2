'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { StatusBadge } from '@/components/moderation/status-badge';
import { useApprovalBooks } from '@/hooks/useApprovalBooks';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type { QueueStatus } from '@/features/books/types';
import { AuthorProfileAccess } from '@/features/books/author-profile-access';
import { UserDetailPanel } from '@/features/users/user-detail-panel';
import { OverviewPageShell } from './overview-page-shell';

const STATUS_TABS: { id: QueueStatus; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending_review', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
];

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function parseStatusParam(raw: string | null): QueueStatus {
  if (raw === 'pending' || raw === 'pending_review') return 'pending_review';
  if (raw === 'approved' || raw === 'rejected' || raw === 'all') return raw;
  return 'all';
}

export function BooksCatalogOverview() {
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput, 400);
  const [page, setPage] = useState(1);
  const [authorProfileUserId, setAuthorProfileUserId] = useState<string | null>(null);
  const [queueStatus, setQueueStatus] = useState<QueueStatus>(() =>
    parseStatusParam(searchParams.get('status')),
  );

  useEffect(() => {
    setQueueStatus(parseStatusParam(searchParams.get('status')));
    setPage(1);
  }, [searchParams]);

  const { books, total, totalPages, stats, loading, error, refetch } = useApprovalBooks({
    status: queueStatus,
    search: debouncedSearch,
    page,
    limit: 15,
  });

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const start = total === 0 ? 0 : (page - 1) * 15 + 1;
  const end = Math.min(page * 15, total);

  return (
    <OverviewPageShell
      title="Books catalog"
      description="Every book in the system. Open a title to review content, formats, and approval status."
      secondaryAction={{ label: 'Approval queue', href: '/dashboard/books' }}
    >
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button type="button" className="ml-2 font-semibold underline" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setQueueStatus(tab.id);
              setPage(1);
            }}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              queueStatus === tab.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-card text-muted ring-1 ring-border hover:bg-surface'
            }`}
          >
            {tab.label}
            {tab.id === 'all' && stats.totalBooks != null && ` (${stats.totalBooks})`}
            {tab.id === 'pending_review' && ` (${stats.pending})`}
            {tab.id === 'approved' && ` (${stats.approved})`}
            {tab.id === 'rejected' && ` (${stats.rejected})`}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <input
            type="search"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
            placeholder="Search title, author, ISBN…"
            className="w-full max-w-md rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/80 text-[10px] font-bold uppercase tracking-wider text-muted">
                <th className="px-6 py-4">Book</th>
                <th className="px-4 py-4">Author</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Submitted</th>
                <th className="px-4 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td colSpan={5} className="px-6 py-6">
                      <div className="h-4 animate-pulse rounded bg-border" />
                    </td>
                  </tr>
                ))}
              {!loading && books.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted">
                    No books found.
                  </td>
                </tr>
              )}
              {!loading &&
                books.map((book) => {
                  const queue =
                    book.status === 'approved'
                      ? 'approved'
                      : book.status === 'rejected'
                        ? 'rejected'
                        : 'pending_review';
                  return (
                    <tr key={book.id} className="border-b border-border transition hover:bg-surface/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {book.coverImageUrl ? (
                            <img
                              src={book.coverImageUrl}
                              alt=""
                              className="h-12 w-9 rounded object-cover ring-1 ring-border"
                            />
                          ) : (
                            <div className="flex h-12 w-9 items-center justify-center rounded bg-primary/10 text-xs font-bold text-primary">
                              {book.title.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-foreground">{book.title}</p>
                            {book.subtitle && (
                              <p className="text-xs text-muted">{book.subtitle}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <AuthorProfileAccess
                          book={book}
                          onOpenProfile={setAuthorProfileUserId}
                          className="text-muted"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge book={book} queueStatus={queue} />
                      </td>
                      <td className="px-4 py-4 text-muted">{formatDate(book.submittedAt)}</td>
                      <td className="px-4 py-4">
                        <Link
                          href={`/dashboard/books/${book.id}?returnTo=/dashboard/overview/books`}
                          className="text-sm font-semibold text-primary hover:underline"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">
            Showing {start}–{end} of {total.toLocaleString()} books
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-xs text-muted">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {authorProfileUserId && (
        <UserDetailPanel
          userId={authorProfileUserId}
          onClose={() => setAuthorProfileUserId(null)}
          onUpdated={() => refetch()}
        />
      )}
    </OverviewPageShell>
  );
}
