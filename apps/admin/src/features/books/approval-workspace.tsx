'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { AnimatedCounter } from '@/components/moderation/animated-counter';
import { BookCardSkeleton } from '@/components/moderation/book-card-skeleton';
import { ConfirmModal } from '@/components/moderation/confirm-modal';
import { EmptyState } from '@/components/moderation/empty-state';
import { StatusBadge } from '@/components/moderation/status-badge';
import { AdminNotificationBell } from '@/components/admin-notification-bell';
import { AdminProfileChip } from '@/components/admin-profile-chip';
import { useToast } from '@/components/toast-provider';
import { useApprovalBooks } from '@/hooks/useApprovalBooks';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { RejectModal } from './reject-modal';
import { NotifyAuthorModal } from './notify-author-modal';
import { AuthorProfileAccess } from './author-profile-access';
import { bookChangesPath } from './book-change-details';
import { UserDetailPanel } from '@/features/users/user-detail-panel';
import { authorNotificationToast } from '@/lib/author-notification-toast';
import type { FilterTab, PendingBook, QueueStatus, SortOption } from './types';

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

const reviewNavBtnSm =
  'inline-flex min-h-[36px] items-center rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-800 transition hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-200 dark:hover:bg-indigo-950/60';

const reviewNavBtnLg =
  'flex w-full items-center justify-center rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50/80 py-3 text-sm font-semibold text-indigo-800 transition hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200 dark:hover:bg-indigo-950/60';

function descriptionPreview(text: string | null, max = 120) {
  if (!text) return 'No description';
  const flat = text.replace(/\s+/g, ' ').trim();
  return flat.length <= max ? flat : `${flat.slice(0, max)}…`;
}

function BookCover({ url, title }: { url: string | null; title: string }) {
  if (url) {
    return (
      <img
        src={url}
        alt=""
        className="h-28 w-20 shrink-0 rounded-xl object-cover shadow-md ring-1 ring-slate-200/80 dark:ring-slate-600"
      />
    );
  }
  return (
    <div className="flex h-28 w-20 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-2xl font-bold text-white shadow-md">
      {title.charAt(0).toUpperCase()}
    </div>
  );
}

function StatPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
        active
          ? 'bg-gradient-to-r from-primary to-accent text-white shadow-md shadow-indigo-500/25'
          : 'bg-card text-slate-600 ring-1 ring-slate-200 hover:shadow-sm dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-600'
      }`}
    >
      {label} (<AnimatedCounter value={count} />)
    </button>
  );
}

function parseQueueStatusFromUrl(raw: string | null): QueueStatus | null {
  if (!raw) return null;
  if (raw === 'all') return 'all';
  if (raw === 'pending' || raw === 'pending_review') return 'pending_review';
  if (raw === 'approved') return 'approved';
  if (raw === 'rejected') return 'rejected';
  return null;
}

export function ApprovalWorkspace() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const initialStatus = parseQueueStatusFromUrl(searchParams.get('status'));
  const [queueStatus, setQueueStatus] = useState<QueueStatus>(initialStatus ?? 'all');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [searchInput, setSearchInput] = useState(() => searchParams.get('search') ?? '');
  const debouncedSearch = useDebouncedValue(searchInput, 400);
  const [sort, setSort] = useState<SortOption>('newest');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailBook, setDetailBook] = useState<PendingBook | null>(null);
  const [acting, setActing] = useState(false);
  const [approveTarget, setApproveTarget] = useState<PendingBook | null>(null);
  const [authorProfileUserId, setAuthorProfileUserId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<PendingBook | null>(null);
  const [notifyTarget, setNotifyTarget] = useState<PendingBook | null>(null);

  useEffect(() => {
    const fromUrl = parseQueueStatusFromUrl(searchParams.get('status'));
    if (fromUrl) setQueueStatus(fromUrl);
  }, [searchParams]);

  const setQueueStatusWithUrl = useCallback((status: QueueStatus) => {
    setQueueStatus(status);
    setPage(1);
    const params = new URLSearchParams(window.location.search);
    if (status === 'all') {
      params.delete('status');
    } else {
      params.set('status', status);
    }
    const qs = params.toString();
    const next = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, '', next);
  }, []);

  const handleNewPending = useCallback(
    (count: number, title?: string) => {
      toast(
        count === 1 && title
          ? `New pending submission: ${title}`
          : `${count} new pending submission(s)`,
        'info',
      );
    },
    [toast],
  );

  const {
    books,
    total,
    totalPages,
    stats,
    loading,
    error,
    refetch,
    fetchBookDetail,
    approveBook,
    rejectBook,
    notifyAuthor,
    revertApproval,
  } = useApprovalBooks({
    status: queueStatus,
    search: debouncedSearch,
    page,
    limit: 20,
    type: filterTab,
    sort,
    autoRefreshMs: queueStatus === 'pending_review' ? 15000 : undefined,
    onNewPending: handleNewPending,
  });

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const selected = books.find((b) => b.id === selectedId) ?? books[0] ?? null;
  const isPending = queueStatus === 'pending_review';
  const canApproveBook = (book: PendingBook) =>
    book.status === 'pending_review' ||
    book.status === 'rejected' ||
    book.status === 'changes_requested';
  const isMetadataUpdate = (book: PendingBook) =>
    book.type === 'UPDATE' || book.submissionType === 'metadata_update';
  const canRejectBook = (book: PendingBook) =>
    book.status === 'pending_review' || book.status === 'approved';
  const canRequestChangesBook = (book: PendingBook) =>
    book.status === 'pending_review' || book.status === 'changes_requested';
  const canNotifyBook = (book: PendingBook) => book.status === 'rejected';

  const openRejectModal = (book: PendingBook) => setRejectTarget(book);
  const openNotifyModal = (book: PendingBook) => setNotifyTarget(book);

  useEffect(() => {
    setSelectedId(null);
    setDetailBook(null);
    setPage(1);
  }, [queueStatus, filterTab, sort]);

  useEffect(() => {
    setSelectedId(null);
    setDetailBook(null);
  }, [debouncedSearch]);

  useEffect(() => {
    if (!selected?.id) {
      setDetailBook(null);
      return;
    }
    let cancelled = false;
    fetchBookDetail(selected.id)
      .then((data) => {
        if (!cancelled) setDetailBook(data);
      })
      .catch(() => {
        if (!cancelled) setDetailBook(selected);
      });
    return () => {
      cancelled = true;
    };
  }, [selected, fetchBookDetail]);

  const displayBook = detailBook ?? selected;

  const handleApprove = async (book: PendingBook) => {
    setActing(true);
    try {
      const payload = await approveBook(book.id, {
        approveChanges: isMetadataUpdate(book),
        skipValidation: true,
        skipContent: true,
      });
      setApproveTarget(null);
      setSelectedId(null);
      const { message, variant } = authorNotificationToast(
        book.title,
        'approved',
        payload?.data?.authorNotification,
      );
      toast(message, variant);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Approve failed', 'error');
    } finally {
      setActing(false);
    }
  };

  const handleRejectOnly = async (payload: Parameters<typeof rejectBook>[1]) => {
    if (!rejectTarget) return;
    setActing(true);
    try {
      await rejectBook(rejectTarget.id, payload, { notify: false });
      toast(`"${rejectTarget.title}" rejected.`, 'success');
      setRejectTarget(null);
      setSelectedId(null);
      await refetch();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Reject failed', 'error');
      throw err;
    } finally {
      setActing(false);
    }
  };

  const handleNotifyAuthor = async (payload: Parameters<typeof notifyAuthor>[1]) => {
    if (!notifyTarget) return;
    setActing(true);
    try {
      const result = await notifyAuthor(notifyTarget.id, payload);
      const { message, variant } = authorNotificationToast(
        notifyTarget.title,
        'rejected',
        result?.data?.authorNotification,
      );
      setNotifyTarget(null);
      toast(message, variant);
      await refetch();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Notify failed', 'error');
      throw err;
    } finally {
      setActing(false);
    }
  };

  const handleRevert = async (book: PendingBook) => {
    setActing(true);
    try {
      await revertApproval(book.id);
      toast(`"${book.title}" returned to pending review.`, 'info');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Action failed', 'error');
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--card)]/95 px-4 py-4 backdrop-blur-md sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex-1">
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-slate-900">
              Book moderation
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Review pending, approved, rejected, and resubmitted submissions.
            </p>
          </div>
          <div className="relative flex-1 lg:max-w-md">
            <input
              type="search"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setPage(1);
              }}
              placeholder="Search title, author, ISBN…"
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-4 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800"
              aria-label="Search books"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as SortOption);
              setPage(1);
            }}
            className="rounded-full border border-slate-200 bg-card px-4 py-2.5 text-sm dark:border-slate-600 dark:bg-slate-800"
            aria-label="Sort books"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="title_asc">Title A–Z</option>
            <option value="title_desc">Title Z–A</option>
          </select>
          <AdminNotificationBell />
          <AdminProfileChip subtitle="Moderator" showText={false} className="px-1 py-1" />
        </div>
        {isPending && debouncedSearch && (
          <p className="mt-2 text-xs text-slate-500">
            Searching pending submissions for &ldquo;{debouncedSearch}&rdquo; — {total} result
            {total === 1 ? '' : 's'}
          </p>
        )}
      </header>

      <div className="p-4 sm:p-6">
        <div className="mb-6 flex flex-wrap gap-2">
          <StatPill
            label="All"
            count={stats.totalBooks ?? 0}
            active={queueStatus === 'all'}
            onClick={() => setQueueStatusWithUrl('all')}
          />
          <StatPill
            label="Pending"
            count={stats.pending}
            active={queueStatus === 'pending_review'}
            onClick={() => {
              setQueueStatusWithUrl('pending_review');
              setFilterTab('all');
              refetch();
            }}
          />
          <StatPill
            label="Approved"
            count={stats.approved}
            active={queueStatus === 'approved'}
            onClick={() => setQueueStatusWithUrl('approved')}
          />
          <StatPill
            label="Rejected"
            count={stats.rejected}
            active={queueStatus === 'rejected'}
            onClick={() => setQueueStatusWithUrl('rejected')}
          />
          {stats.resubmitted != null && stats.resubmitted > 0 && (
            <span className="ml-auto self-center rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
              <AnimatedCounter value={stats.resubmitted} /> submitted again awaiting review
            </span>
          )}
        </div>

        {isPending && (
          <div className="mb-4 flex flex-wrap gap-2">
            {(
              [
                ['all', 'All'],
                ['new_entry', 'New entries'],
                ['metadata_update', 'Updates'],
                ['resubmitted', 'Submitted again'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setFilterTab(id);
                  setPage(1);
                }}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  filterTab === id
                    ? 'bg-primary text-white'
                    : 'bg-card text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
            {error}
            <button
              type="button"
              className="ml-2 font-semibold underline"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            {loading &&
              Array.from({ length: 4 }).map((_, i) => <BookCardSkeleton key={i} />)}

            {!loading && books.length === 0 && (
              <EmptyState
                title="No books here"
                description={
                  isPending
                    ? 'New submissions will appear automatically. Try adjusting search or filters.'
                    : queueStatus === 'all'
                      ? 'No books in the catalog yet.'
                      : `No ${queueStatus.replace('_', ' ')} books match your criteria.`
                }
              />
            )}

            {!loading &&
              books.map((book) => (
                <article
                  key={book.id}
                  onClick={() => setSelectedId(book.id)}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedId(book.id)}
                  role="button"
                  tabIndex={0}
                  className={`group cursor-pointer rounded-2xl border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:bg-slate-900 ${
                    selected?.id === book.id
                      ? 'border-indigo-400 ring-2 ring-indigo-500/20'
                      : 'border-slate-200/80 dark:border-slate-700'
                  }`}
                >
                  <div className="flex gap-4">
                    <BookCover url={book.coverImageUrl} title={book.title} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="font-semibold text-slate-900">
                          {book.title}
                        </h3>
                        <StatusBadge book={book} queueStatus={queueStatus} />
                      </div>
                      <p className="mt-0.5 text-sm text-slate-500">
                        {book.author.publicName}
                        {book.genre ? ` · ${book.genre}` : ''}
                      </p>
                      <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                        {descriptionPreview(book.description)}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                        <span>Uploaded {formatDate(book.submittedAt)}</span>
                        {book.chapterCount != null && (
                          <span>{book.chapterCount} section(s)</span>
                        )}
                        {queueStatus === 'approved' && book.reviewedAt && (
                          <span>Approved {formatDate(book.reviewedAt)}</span>
                        )}
                        {queueStatus === 'rejected' && book.reviewNote && (
                          <span className="text-red-600 dark:text-red-400">
                            {book.reviewNote.slice(0, 60)}…
                          </span>
                        )}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                        {canApproveBook(book) && (
                          <button
                            type="button"
                            disabled={acting}
                            onClick={() => setApproveTarget(book)}
                            className="rounded-lg bg-emerald-400 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500"
                          >
                            {isMetadataUpdate(book) ? 'Approve changes' : 'Approve'}
                          </button>
                        )}
                        {canRejectBook(book) && (
                          <button
                            type="button"
                            disabled={acting}
                            onClick={() => openRejectModal(book)}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 dark:border-red-800"
                          >
                            Reject
                          </button>
                        )}
                        {canNotifyBook(book) && (
                          <button
                            type="button"
                            disabled={acting}
                            onClick={() => openNotifyModal(book)}
                            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white"
                          >
                            Notify
                          </button>
                        )}
                        {book.status === 'approved' && (
                          <button
                            type="button"
                            disabled={acting}
                            onClick={() => handleRevert(book)}
                            className="rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-700"
                          >
                            Remove approval
                          </button>
                        )}
                        <Link href={bookChangesPath(book.id)} className={reviewNavBtnSm}>
                          Change details
                        </Link>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAuthorProfileUserId(book.author.id);
                          }}
                          className={reviewNavBtnSm}
                        >
                          Author profile
                        </button>
                        <Link href={`/dashboard/books/${book.id}`} className={reviewNavBtnSm}>
                          Full review
                        </Link>
                        <Link
                          href={`/dashboard/books/${book.id}/reader?returnTo=${encodeURIComponent('/dashboard/books')}`}
                          className={reviewNavBtnSm}
                        >
                          Get content
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))}

            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between rounded-xl bg-card px-4 py-3 text-sm dark:bg-slate-900">
                <span className="text-slate-600 dark:text-slate-400">
                  Page {page} of {totalPages} · {total} total
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="rounded-lg border px-3 py-1 disabled:opacity-40 dark:border-slate-600"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-lg border px-3 py-1 disabled:opacity-40 dark:border-slate-600"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          <aside className="hidden xl:block">
            {!displayBook ? (
              <EmptyState
                title="Select a book"
                description="Click a submission to preview changes and moderation history."
                icon="👈"
              />
            ) : (
              <div className="sticky top-24 space-y-4">
                <div className="rounded-2xl border border-slate-200/80 bg-card p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                  <div className="flex items-start justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Quick review
                    </h3>
                    <StatusBadge book={displayBook} queueStatus={queueStatus} />
                  </div>
                  <Link
                    href={`/dashboard/books/${displayBook.id}`}
                    className="mt-2 block text-lg font-semibold text-foreground hover:text-primary hover:underline"
                  >
                    {displayBook.title}
                  </Link>
                  <p className="text-sm text-slate-500">
                    <AuthorProfileAccess
                      book={displayBook}
                      onOpenProfile={setAuthorProfileUserId}
                      className="text-slate-700 dark:text-slate-300"
                    />
                  </p>
                  <button
                    type="button"
                    onClick={() => setAuthorProfileUserId(displayBook.author.id)}
                    className="mt-2 text-xs font-semibold text-primary hover:underline"
                  >
                    Open author profile →
                  </button>

                  <div className="mt-4 flex flex-col gap-2">
                    <Link
                      href={`/dashboard/books/${displayBook.id}`}
                      className={reviewNavBtnLg}
                    >
                      Open full review →
                    </Link>
                    <Link href={bookChangesPath(displayBook.id)} className={reviewNavBtnLg}>
                      Change details →
                    </Link>
                  </div>

                  {(displayBook.reviewNote || displayBook.reviewMetadata) && (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/30">
                      <p className="text-xs font-bold uppercase text-red-700">Rejection</p>
                      <p className="mt-1 text-sm text-red-900 dark:text-red-200">
                        {displayBook.reviewMetadata?.reason || displayBook.reviewNote}
                      </p>
                    </div>
                  )}

                  {canNotifyBook(displayBook) && (
                    <div className="mt-4 flex flex-col gap-2">
                      <button
                        type="button"
                        disabled={acting}
                        onClick={() => openNotifyModal(displayBook)}
                        className={reviewNavBtnLg}
                      >
                        Notify
                      </button>
                    </div>
                  )}
                </div>

                {displayBook.activity && displayBook.activity.length > 0 && (
                  <div className="rounded-2xl border bg-card p-5 dark:border-slate-700 dark:bg-slate-900">
                    <h3 className="text-sm font-semibold">Activity</h3>
                    <ul className="mt-3 space-y-3 border-l-2 border-indigo-200 pl-4 dark:border-indigo-800">
                      {displayBook.activity.slice(0, 5).map((a) => (
                        <li key={a.id} className="relative text-sm">
                          <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-surface0" />
                          <p className="capitalize dark:text-slate-200">{a.message}</p>
                          <p className="text-xs text-slate-400">{formatDate(a.at)}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      </div>

      {authorProfileUserId && (
        <UserDetailPanel
          userId={authorProfileUserId}
          onClose={() => setAuthorProfileUserId(null)}
          onUpdated={() => void refetch()}
        />
      )}

      <ConfirmModal
        open={!!approveTarget}
        title={
          approveTarget && isMetadataUpdate(approveTarget)
            ? 'Approve these changes?'
            : 'Approve this book?'
        }
        description={
          approveTarget && isMetadataUpdate(approveTarget)
            ? `"${approveTarget.title}" — the author's proposed updates will be applied and published. The author will be notified.`
            : `"${approveTarget?.title}" will be published in the catalog. The author will be notified.`
        }
        confirmLabel={
          approveTarget && isMetadataUpdate(approveTarget) ? 'Approve changes' : 'Approve & publish'
        }
        loading={acting}
        onClose={() => setApproveTarget(null)}
        onConfirm={() => {
          if (approveTarget && !acting) void handleApprove(approveTarget);
        }}
      />

      <RejectModal
        open={!!rejectTarget}
        bookTitle={rejectTarget?.title || ''}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleRejectOnly}
        loading={acting}
      />

      <NotifyAuthorModal
        open={!!notifyTarget}
        bookTitle={notifyTarget?.title || ''}
        authorName={notifyTarget?.author.publicName}
        authorEmail={notifyTarget?.author.email}
        initialReason={notifyTarget?.reviewMetadata?.reason || notifyTarget?.reviewNote || ''}
        initialAdminNotes={notifyTarget?.reviewMetadata?.adminNotes || ''}
        initialSuggestedFixes={notifyTarget?.reviewMetadata?.suggestedFixes || ''}
        initialSeverity={
          (notifyTarget?.reviewMetadata?.severity as 'low' | 'medium' | 'high') || 'medium'
        }
        onClose={() => setNotifyTarget(null)}
        onConfirm={handleNotifyAuthor}
        loading={acting}
      />
    </div>
  );
}
