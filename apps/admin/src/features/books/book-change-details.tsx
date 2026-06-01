'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ConfirmModal } from '@/components/moderation/confirm-modal';
import { StatusBadge } from '@/components/moderation/status-badge';
import { AdminProfileChip } from '@/components/admin-profile-chip';
import { useToast } from '@/components/toast-provider';
import { getApiErrorMessage } from '@/lib/api-error';
import { authorNotificationToast } from '@/lib/author-notification-toast';
import { AuthorProfileAccess } from '@/features/books/author-profile-access';
import { getBookChangeReviewProgress } from '@/features/books/change-review-progress';
import { ChangeDetailPanel } from '@/features/books/change-detail-panel';
import { isBookModeratable, rejectBookSubmission } from '@/features/books/change-moderation-api';
import { NotifyAuthorModal } from '@/features/books/notify-author-modal';
import { RejectModal } from '@/features/books/reject-modal';
import { useChangeDetailModeration } from '@/features/books/use-change-detail-moderation';
import type { PendingBook } from '@/features/books/types';
import { UserDetailPanel } from '@/features/users/user-detail-panel';

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(
      new Date(iso),
    );
  } catch {
    return iso ?? '—';
  }
}

export function bookChangesPath(bookId: string, returnTo = '/dashboard/books') {
  const q = new URLSearchParams();
  if (returnTo && returnTo !== '/dashboard/books') {
    q.set('returnTo', returnTo);
  }
  const qs = q.toString();
  return `/dashboard/books/${bookId}/changes${qs ? `?${qs}` : ''}`;
}

export function BookChangeDetails() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const returnTo = searchParams.get('returnTo') || '/dashboard/books';
  const fullReviewHref = `/dashboard/books/${id}${
    returnTo !== '/dashboard/books' ? `?returnTo=${encodeURIComponent(returnTo)}` : ''
  }`;
  const backLabel = returnTo.includes('/users') ? '← User management' : '← Moderation queue';
  const { toast } = useToast();

  const [book, setBook] = useState<PendingBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [rejectBusy, setRejectBusy] = useState(false);
  const [authorProfileUserId, setAuthorProfileUserId] = useState<string | null>(null);

  const loadBook = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/books/${id}`, { credentials: 'include' });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(getApiErrorMessage(payload, 'Failed to load book'));
      }
      setBook(payload.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const reloadBookQuiet = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/books/${id}`, { credentials: 'include' });
      const payload = await res.json();
      if (res.ok && payload.success) {
        const incoming = payload.data as PendingBook;
        setBook((prev) => {
          if (!prev) return incoming;
          const prevRs = prev.reviewState;
          const nextRs = incoming.reviewState;
          if (!nextRs) return incoming;
          return {
            ...incoming,
            reviewState: {
              checklist: { ...prevRs?.checklist, ...nextRs.checklist },
              pdfReview: { ...prevRs?.pdfReview, ...nextRs.pdfReview },
              audioReview: { ...prevRs?.audioReview, ...nextRs.audioReview },
              changeDecisions: {
                ...prevRs?.changeDecisions,
                ...nextRs.changeDecisions,
              },
            },
          };
        });
      }
    } catch {
      /* keep optimistic state */
    }
  }, [id]);

  useEffect(() => {
    loadBook();
  }, [loadBook]);

  const reviewProgress = useMemo(
    () =>
      book
        ? getBookChangeReviewProgress(book, true)
        : {
            total: 0,
            approved: 0,
            rejected: 0,
            pending: 0,
            allApproved: false,
            allReviewed: false,
            changeIds: [],
          },
    [book],
  );

  const moderation = useChangeDetailModeration(book, setBook, reloadBookQuiet, loadBook);

  const rejectOnly = async (body: {
    reason: string;
    adminNotes?: string;
    suggestedFixes?: string;
    severity?: string;
  }) => {
    if (!book) return;
    setRejectBusy(true);
    try {
      await rejectBookSubmission(book.id, body);
      toast(`"${book.title}" rejected.`, 'success');
      setShowReject(false);
      await loadBook();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to reject', 'error');
      throw err;
    } finally {
      setRejectBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-background p-8">
        <p className="text-red-600">{error || 'Book not found'}</p>
        <Link href={returnTo} className="mt-4 inline-block text-primary hover:underline">
          {backLabel}
        </Link>
      </div>
    );
  }

  const queueStatus =
    book.status === 'approved'
      ? 'approved'
      : book.status === 'rejected'
        ? 'rejected'
        : 'pending_review';

  const isUpdate = book.type === 'UPDATE' || book.submissionType === 'metadata_update';
  const canInteract = moderation.canInteract;
  const headerBusy = moderation.bookBusy;
  const headerApproveLabel =
    isUpdate && reviewProgress.allApproved ? 'Approve update' : 'Approve book';

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-end border-b border-border bg-card px-4 py-3">
        <AdminProfileChip subtitle="Moderator" showText={false} className="px-1 py-1" />
      </div>

      <div className="mx-auto max-w-5xl p-4 sm:p-8">
        <Link href={returnTo} className="text-sm font-medium text-primary hover:underline">
          {backLabel}
        </Link>

        <div className="mt-6 flex flex-wrap items-start gap-6">
          {book.coverImageUrl ? (
            <img
              src={book.coverImageUrl}
              alt=""
              className="h-40 w-28 shrink-0 rounded-2xl object-cover shadow-lg ring-1 ring-border"
            />
          ) : (
            <div className="flex h-40 w-28 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-2xl font-bold text-white">
              {book.title.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge book={book} queueStatus={queueStatus} />
              {isUpdate && (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    reviewProgress.allApproved
                      ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-200'
                      : 'bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-200'
                  }`}
                >
                  {reviewProgress.allApproved
                    ? 'All changes approved'
                    : `Update submission (${reviewProgress.approved}/${reviewProgress.total} approved)`}
                </span>
              )}
            </div>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold sm:text-3xl">
              Change details
            </h1>
            <p className="mt-1 text-lg text-muted-foreground">{book.title}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Submitted {formatDate(book.submittedAt)} · {book.status.replace(/_/g, ' ')}
            </p>
            {!canInteract && !isBookModeratable(book.status) && book.status !== 'approved' && (
              <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                This book is not in a reviewable state ({book.status}).
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <AuthorProfileAccess
                book={book}
                variant="button"
                onOpenProfile={setAuthorProfileUserId}
              />
              <Link
                href={fullReviewHref}
                className="inline-flex min-h-[44px] items-center rounded-lg border-2 border-dashed border-indigo-300 bg-indigo-50/80 px-4 py-2 text-sm font-semibold text-indigo-800 transition hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200 dark:hover:bg-indigo-950/60"
              >
                Full review
              </Link>
              <Link
                href={`/dashboard/books/${id}/reader?returnTo=${encodeURIComponent(bookChangesPath(id, returnTo))}`}
                className="inline-flex min-h-[44px] items-center rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-800 transition hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-200 dark:hover:bg-indigo-950/60"
              >
                Get content
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Below each change you will see <strong>Approve change</strong> and{' '}
          <strong>Reject change</strong>. Use the header to approve or reject the whole book when
          finished.
        </p>

        <div className="mt-8">
          <ChangeDetailPanel
            book={book}
            showFullComparison
            moderationActions={{
              acting: headerBusy,
              canApprove: canInteract,
              canReject: canInteract || book.status === 'approved',
              approveLabel: headerApproveLabel,
              onApprove: () => setShowApproveConfirm(true),
              onReject: () => setShowReject(true),
              canModerateItems: true,
              actingItemId: moderation.activeChangeId,
              actingAction: moderation.activeAction,
              onItemApprove: moderation.onItemApprove,
              onItemReject: moderation.onItemReject,
              itemApproveLabel: 'Approve change',
              itemRejectLabel: 'Reject change',
            }}
          />
        </div>
      </div>

      <ConfirmModal
        open={showApproveConfirm}
        title={reviewProgress.allApproved && isUpdate ? 'Approve update?' : 'Approve book?'}
        description={
          reviewProgress.allApproved && isUpdate
            ? `"${book.title}" — all individual changes are approved. Publish this update now?`
            : `"${book.title}" — all changes will be published and the book approved.`
        }
        confirmLabel={headerApproveLabel}
        loading={moderation.bookBusy}
        onClose={() => setShowApproveConfirm(false)}
        onConfirm={() => void moderation.approveBook()}
      />
      <RejectModal
        open={showReject}
        bookTitle={book.title}
        onClose={() => setShowReject(false)}
        onConfirm={rejectOnly}
        loading={rejectBusy}
      />
      {authorProfileUserId && (
        <UserDetailPanel
          userId={authorProfileUserId}
          onClose={() => setAuthorProfileUserId(null)}
          onUpdated={() => void loadBook()}
        />
      )}
    </div>
  );
}
