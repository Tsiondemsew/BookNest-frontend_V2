'use client';

import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ConfirmModal } from '@/components/moderation/confirm-modal';
import { StatusBadge } from '@/components/moderation/status-badge';
import { AdminProfileChip } from '@/components/admin-profile-chip';
import { getApiErrorMessage } from '@/lib/api-error';
import { authorNotificationToast } from '@/lib/author-notification-toast';
import { useToast } from '@/components/toast-provider';
import { RejectModal } from '@/features/books/reject-modal';
import { NotifyAuthorModal } from '@/features/books/notify-author-modal';
import { AuthorProfileAccess } from '@/features/books/author-profile-access';
import { bookChangesPath } from '@/features/books/book-change-details';
import { FormatReviewPanel } from '@/features/books/format-review-panel';
import { UserDetailPanel } from '@/features/users/user-detail-panel';
import {
  approveButtonClass,
  rejectButtonClass,
} from '@/features/books/moderation-button-styles';
import { hasPlayableContent } from '@/lib/format-playback';
import type { BookFormatDetail, FormatSlots, PendingBook, ReviewState } from '@/features/books/types';

function mergeReviewStateFromApi(
  current: ReviewState | undefined,
  payload: { data?: { reviewState?: ReviewState }; reviewState?: ReviewState },
): ReviewState | undefined {
  const fromApi = payload?.data?.reviewState ?? payload?.reviewState;
  if (!fromApi || typeof fromApi !== 'object') return current;
  return {
    checklist: { ...current?.checklist, ...fromApi.checklist },
    pdfReview: { ...current?.pdfReview, ...fromApi.pdfReview },
    audioReview: { ...current?.audioReview, ...fromApi.audioReview },
    changeDecisions: { ...current?.changeDecisions, ...fromApi.changeDecisions },
  };
}

const CHECKLIST_LABELS: Record<string, string> = {
  noCopyrightViolations: 'No copyright violations',
  noPlagiarism: 'No plagiarism',
  metadataAccurate: 'Metadata accurate',
  pdfFormattingAcceptable: 'PDF formatting acceptable',
  audioQualityAcceptable: 'Audio quality acceptable',
};

const ESSENTIAL_CHECKLIST_KEYS = [
  'noCopyrightViolations',
  'noPlagiarism',
  'metadataAccurate',
] as const;

const REVENUE_CHECKLIST_LABELS: Record<string, string> = {
  revenueAgreementSigned: 'Revenue agreement verified',
  pricingReasonable: 'Pricing and author revenue share verified',
};

const REVENUE_CHECKLIST_KEYS = ['revenueAgreementSigned', 'pricingReasonable'] as const;

const CHECKBOX_CLASS =
  'h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 accent-emerald-500 text-emerald-600 focus:ring-2 focus:ring-emerald-400/50 dark:border-slate-600 dark:accent-emerald-500';

function ChecklistRow({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <li>
      <label
        className={`flex items-center gap-3 text-sm ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
      >
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          className={CHECKBOX_CLASS}
          onChange={(e) => onChange(e.target.checked)}
        />
        {label}
      </label>
    </li>
  );
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(
      new Date(iso),
    );
  } catch {
    return iso;
  }
}

function money(amount: number | null | undefined, currency: string) {
  if (amount == null) return '—';
  return `${currency === 'ETB' ? 'ETB ' : '$'}${amount.toFixed(2)}`;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[65%] text-right font-medium text-foreground">{value ?? '—'}</span>
    </div>
  );
}

function buildClientFormatSlots(formats: BookFormatDetail[] | undefined): FormatSlots {
  const empty = (formatType: 'PDF' | 'Audio'): BookFormatDetail => ({
    id: null,
    formatType,
    price: null,
    currency: 'ETB',
    fileUrl: null,
    fileName: null,
    fileSizeBytes: null,
    pageCount: null,
    durationSec: null,
    uploadedAt: null,
    hasContent: false,
    missing: true,
  });
  const pdf = formats?.find((f) => f.formatType === 'PDF') ?? empty('PDF');
  const audio = formats?.find((f) => f.formatType === 'Audio') ?? empty('Audio');
  return { pdf, audio };
}

export function BookReviewDetail() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const returnTo = searchParams.get('returnTo') || '/dashboard/books';
  const viewMode = searchParams.get('view');
  const backLabel = returnTo.includes('/users') ? '← User management' : '← Moderation';
  const readerReturnTo = encodeURIComponent(
    `/dashboard/books/${id}${searchParams.get('returnTo') ? `?returnTo=${encodeURIComponent(searchParams.get('returnTo')!)}` : ''}${viewMode ? `&view=${viewMode}` : ''}`,
  );
  const { toast } = useToast();

  const [book, setBook] = useState<PendingBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState(false);
  const [showApprove, setShowApprove] = useState(false);
  const [showApproveChanges, setShowApproveChanges] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [showNotify, setShowNotify] = useState(false);
  const [showChanges, setShowChanges] = useState(false);
  const [changesFeedback, setChangesFeedback] = useState('');
  const [hashChanges, setHashChanges] = useState(false);
  const [authorProfileUserId, setAuthorProfileUserId] = useState<string | null>(null);

  const loadBook = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/books/${id}`, { credentials: 'include' });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(payload.error?.message || 'Failed to load book');
      }
      setBook(payload.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadBook();
  }, [loadBook]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncChangesFocus = () => {
      setHashChanges(window.location.hash === '#changes');
    };

    syncChangesFocus();
    window.addEventListener('hashchange', syncChangesFocus);
    return () => window.removeEventListener('hashchange', syncChangesFocus);
  }, []);

  useEffect(() => {
    if (viewMode === 'changes' || hashChanges) {
      router.replace(bookChangesPath(id, returnTo));
    }
  }, [viewMode, hashChanges, id, returnTo, router]);

  const formatSlots = book?.formatSlots ?? buildClientFormatSlots(book?.formats);
  const pricing = book?.pricing;
  const agreement = book?.revenueAgreement;
  const reviewState = book?.reviewState;
  const signedAuthorName =
    agreement?.authorName ||
    book?.authorProfile?.name ||
    book?.author?.publicName ||
    'Author';

  const contentChecklistKeys = useMemo(() => {
    const keys: string[] = [...ESSENTIAL_CHECKLIST_KEYS];
    if (hasPlayableContent(formatSlots.pdf)) {
      keys.push('pdfFormattingAcceptable');
    }
    if (hasPlayableContent(formatSlots.audio)) {
      keys.push('audioQualityAcceptable');
    }
    return keys;
  }, [formatSlots]);

  const allApprovalCheckKeys = useMemo(
    () => [...contentChecklistKeys, ...REVENUE_CHECKLIST_KEYS],
    [contentChecklistKeys],
  );

  const uncheckedItems = useMemo(() => {
    return allApprovalCheckKeys.filter((key) => !reviewState?.checklist?.[key]);
  }, [allApprovalCheckKeys, reviewState?.checklist]);

  const allChecksComplete = uncheckedItems.length === 0;

  const approveHints = useMemo(() => {
    const hints: string[] = [];
    if (hasPlayableContent(formatSlots.pdf) && reviewState?.pdfReview?.status !== 'approved') {
      hints.push('Use Approve on the PDF panel before publishing, or approval will mark it approved.');
    }
    if (hasPlayableContent(formatSlots.audio) && reviewState?.audioReview?.status !== 'approved') {
      hints.push('Use Approve on the audio panel before publishing, or approval will mark it approved.');
    }
    return hints;
  }, [reviewState, formatSlots]);

  const canFinalApprove = Boolean(
    book &&
      ['pending_review', 'rejected', 'changes_requested'].includes(book.status) &&
      allChecksComplete,
  );

  const toggleChecklistItem = (key: string, checked: boolean) => {
    const checklist = { ...reviewState?.checklist, [key]: checked };
    void patchReviewState({ checklist });
  };

  const patchReviewState = async (patch: Partial<ReviewState>) => {
    if (!book) return;
    setActing(true);
    try {
      const res = await fetch(`/api/admin/books/${book.id}/review-state`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) throw new Error(getApiErrorMessage(payload, 'Save failed'));
      setBook((b) =>
        b
          ? { ...b, reviewState: mergeReviewStateFromApi(b.reviewState, payload) ?? b.reviewState }
          : b,
      );
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error');
    } finally {
      setActing(false);
    }
  };

  const contentReview = async (
    target: 'pdf' | 'audio',
    status: string,
    comment = '',
  ) => {
    if (!book) return;
    setActing(true);
    try {
      const res = await fetch(`/api/admin/books/${book.id}/content-review`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, status, comment: comment.trim() || undefined }),
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) throw new Error(getApiErrorMessage(payload, 'Failed'));
      setBook((b) =>
        b
          ? { ...b, reviewState: mergeReviewStateFromApi(b.reviewState, payload) ?? b.reviewState }
          : b,
      );
      toast(`${target.toUpperCase()} marked ${status.replace(/_/g, ' ')}`, 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error');
    } finally {
      setActing(false);
    }
  };

  const approveContentFormat = async (target: 'pdf' | 'audio') => {
    if (!book) return;
    const res = await fetch(`/api/admin/books/${book.id}/content-review`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target, status: 'approved' }),
    });
    const payload = await res.json();
    if (!res.ok || !payload.success) {
      throw new Error(getApiErrorMessage(payload, `Failed to approve ${target}`));
    }
    setBook((b) =>
      b ? { ...b, reviewState: mergeReviewStateFromApi(b.reviewState, payload) ?? b.reviewState } : b,
    );
  };

  const ensureContentReviewsApproved = async () => {
    if (!book) return;
    if (hasPlayableContent(formatSlots.pdf) && reviewState?.pdfReview?.status !== 'approved') {
      await approveContentFormat('pdf');
    }
    const audioPending =
      hasPlayableContent(formatSlots.audio) &&
      (book.reviewState?.audioReview?.status ?? reviewState?.audioReview?.status) !== 'approved';
    if (audioPending) {
      await approveContentFormat('audio');
    }
  };

  const approve = async (options?: { approveChanges?: boolean }) => {
    if (!book) return;
    if (!['pending_review', 'rejected', 'changes_requested'].includes(book.status)) {
      toast('This book is not in a reviewable status.', 'error');
      return;
    }
    if (!allChecksComplete) {
      toast('Check all verification items (including revenue agreement) before approving.', 'error');
      return;
    }
    setActing(true);
    try {
      await ensureContentReviewsApproved();
      const res = await fetch(`/api/admin/books/${book.id}/approve`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skipContent: false,
          skipValidation: options?.approveChanges === true,
          approveChanges: options?.approveChanges === true,
        }),
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) throw new Error(getApiErrorMessage(payload, 'Approve failed'));
      const { message, variant } = authorNotificationToast(
        book.title,
        'approved',
        payload?.data?.authorNotification,
      );
      toast(message, variant);
      await loadBook();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error');
    } finally {
      setActing(false);
      setShowApprove(false);
      setShowApproveChanges(false);
    }
  };

  const rejectOnly = async (body: {
    reason: string;
    adminNotes?: string;
    suggestedFixes?: string;
    severity?: string;
  }) => {
    if (!book) return;
    setActing(true);
    try {
      const res = await fetch(`/api/admin/books/${book.id}/reject`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, notify: true }),
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) throw new Error(getApiErrorMessage(payload, 'Reject failed'));
      toast(`"${book.title}" rejected.`, 'success');
      setShowReject(false);
      await loadBook();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error');
      throw err;
    } finally {
      setActing(false);
    }
  };

  const requestChanges = async () => {
    if (!book || changesFeedback.trim().length < 5) {
      toast('Enter at least 5 characters of feedback', 'error');
      return;
    }
    setActing(true);
    try {
      const res = await fetch(`/api/admin/books/${book.id}/request-changes`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: changesFeedback }),
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) throw new Error(getApiErrorMessage(payload, 'Failed'));
      const { message, variant } = authorNotificationToast(
        book.title,
        'changes requested',
        payload?.data?.authorNotification,
      );
      toast(message, variant);
      setShowChanges(false);
      setChangesFeedback('');
      await loadBook();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error');
    } finally {
      setActing(false);
    }
  };

  const revertApproval = async () => {
    if (!book) return;
    setActing(true);
    try {
      const res = await fetch(`/api/admin/books/${book.id}/revert-approval`, {
        method: 'POST',
        credentials: 'include',
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) throw new Error(getApiErrorMessage(payload, 'Failed'));
      toast('Returned to review queue.', 'success');
      await loadBook();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error');
    } finally {
      setActing(false);
    }
  };

  const notifyAuthor = async (body: {
    reason: string;
    adminNotes?: string;
    suggestedFixes?: string;
    severity?: string;
  }) => {
    if (!book) return;
    setActing(true);
    try {
      const res = await fetch(`/api/admin/books/${book.id}/notify-author`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) throw new Error(getApiErrorMessage(payload, 'Notify failed'));
      const { message, variant } = authorNotificationToast(
        book.title,
        'rejected',
        payload?.data?.authorNotification,
      );
      toast(message, variant);
      setShowNotify(false);
      await loadBook();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error');
      throw err;
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="p-8">
        <p className="text-red-600">{error || 'Book not found'}</p>
        <Link href="/dashboard/books" className="mt-4 inline-block text-primary">
          ← Queue
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
  const redirectingToChanges = viewMode === 'changes' || hashChanges;
  const fullReviewHref = `/dashboard/books/${id}${returnTo !== '/dashboard/books' ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`;
  const changesReviewHref = bookChangesPath(id, returnTo);

  if (redirectingToChanges) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-end border-b border-border bg-card px-4 py-3">
        <AdminProfileChip subtitle="Moderator" showText={false} className="px-1 py-1" />
      </div>

      <div className="mx-auto max-w-6xl p-4 sm:p-8">
        <Link href={returnTo} className="text-sm font-medium text-primary hover:underline">
          {backLabel}
        </Link>

        <div className="mt-6 flex flex-wrap items-start gap-6">
          {book.coverImageUrl ? (
            <img src={book.coverImageUrl} alt="" className="w-40 rounded-2xl shadow-lg ring-1 ring-border" />
          ) : (
            <div className="flex h-56 w-40 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-3xl font-bold text-white">
              {book.title.charAt(0)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge book={book} queueStatus={queueStatus} />
              {book.versionNumber && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                  v{book.versionNumber}
                </span>
              )}
            </div>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold">{book.title}</h1>
            {book.subtitle && <p className="text-lg text-muted-foreground">{book.subtitle}</p>}
            <p className="mt-2 text-sm text-muted-foreground">
              Submitted {formatDate(book.submittedAt)} · {book.status.replace(/_/g, ' ')}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <AuthorProfileAccess
                book={book}
                variant="button"
                onOpenProfile={setAuthorProfileUserId}
              />
              <Link
                href={`/dashboard/books/${id}/reader?returnTo=${readerReturnTo}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
              >
                Get content
              </Link>
              {isUpdate && (
                <Link
                  href={changesReviewHref}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-800 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-200"
                >
                  Change details
                </Link>
              )}
              <a
                href="#metadata-modifications"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface"
              >
                Metadata & modifications
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Section title="Format review decisions">
            <p className="mb-4 text-sm text-muted-foreground">
              Use <strong>Get content</strong> to open the PDF or audio in the admin reader (uploaded
              files from the database; demo only if missing).
            </p>
            <div className="grid gap-6 lg:grid-cols-2">
              <FormatReviewPanel
                bookId={id}
                kind="pdf"
                format={formatSlots.pdf}
                review={
                  reviewState?.pdfReview ?? {
                    status: 'pending',
                    comment: null,
                    reviewedAt: null,
                    reviewedBy: null,
                  }
                }
                onReview={(s) => contentReview('pdf', s)}
                acting={acting}
                bookTitle={book.title}
                bookDescription={book.description}
                embedViewer={false}
                readerHref={`/dashboard/books/${id}/reader?format=pdf&returnTo=${readerReturnTo}`}
              />
              <FormatReviewPanel
                bookId={id}
                kind="audio"
                format={formatSlots.audio}
                review={
                  reviewState?.audioReview ?? {
                    status: 'pending',
                    comment: null,
                    reviewedAt: null,
                    reviewedBy: null,
                  }
                }
                onReview={(s) => contentReview('audio', s)}
                acting={acting}
                bookTitle={book.title}
                bookDescription={book.description}
                embedViewer={false}
                readerHref={`/dashboard/books/${id}/reader?format=audio&returnTo=${readerReturnTo}`}
              />
            </div>
          </Section>
        </div>

        <div id="metadata-modifications" className="mt-10 scroll-mt-6 border-t border-border pt-8">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-foreground">
            Metadata & modifications
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            After reviewing content in the reader, verify book metadata, pricing, and proposed field
            changes below.
          </p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Section title="Book information">
            <Row label="Category" value={book.genre} />
            <Row label="Tags" value={book.tags?.length ? book.tags.join(', ') : '—'} />
            <Row label="Language" value={book.language} />
            <Row label="ISBN" value={book.isbn} />
            <Row label="Publication date" value={book.publicationDate || '—'} />
            <Row
              label="Author"
              value={<AuthorProfileAccess book={book} onOpenProfile={setAuthorProfileUserId} />}
            />
            <Row label="Author email" value={book.authorProfile?.email || book.author.email} />
            <Row label="Publisher" value={book.publisherName} />
            <Row label="DRM" value={book.drm?.label} />
            <Row
              label="Visibility"
              value={book.visibility?.marketplaceVisible ? 'Marketplace (when approved)' : 'Hidden'}
            />
            <Row label="Book status" value={book.status} />
            <p className="mt-4 text-sm text-muted-foreground whitespace-pre-wrap">{book.description || '—'}</p>
          </Section>

          <Section title="Pricing information">
            <p className="text-xs font-bold uppercase text-muted-foreground">Author price settings</p>
            <Row label="PDF price" value={money(pricing?.pdfPrice ?? null, pricing?.currency || 'ETB')} />
            <Row label="Audio price" value={money(pricing?.audioPrice ?? null, pricing?.currency || 'ETB')} />
            <Row label="Bundle price" value={money(pricing?.bundlePrice ?? null, pricing?.currency || 'ETB')} />
            <Row label="Currency" value={pricing?.currency} />
            <Row
              label="Author revenue share"
              value={`${pricing?.authorRevenueSharePercent ?? 70}%`}
            />
            <Row label="Platform share" value={`${pricing?.platformSharePercent ?? 30}%`} />
            <Row
              label="Est. author earnings (sample)"
              value={money(pricing?.estimatedAuthorEarnings ?? null, pricing?.currency || 'ETB')}
            />
            <Row
              label="Platform earnings (sample)"
              value={money(pricing?.platformEarnings ?? null, pricing?.currency || 'ETB')}
            />
          </Section>
        </div>

        <div className="mt-6">
          <Section title="Revenue agreement verification">
            <p className="mb-3 text-sm text-muted-foreground">
              Confirm each item below before you approve. The author must have accepted BookNest
              revenue terms (in the app or offline).
            </p>
            {agreement?.signed ? (
              <p className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50/80 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
                <span className="font-semibold">{signedAuthorName}</span> signed digitally
                {agreement.acceptedAt ? ` on ${formatDate(agreement.acceptedAt)}` : ''}. Still
                check both boxes to confirm your review.
              </p>
            ) : null}
            <ul className="space-y-2">
              {REVENUE_CHECKLIST_KEYS.map((key) => (
                <ChecklistRow
                  key={key}
                  label={REVENUE_CHECKLIST_LABELS[key]}
                  checked={Boolean(reviewState?.checklist?.[key])}
                  onChange={(checked) => toggleChecklistItem(key, checked)}
                />
              ))}
            </ul>
          </Section>
        </div>

        <div className="mt-6">
          <Section title="Content review checklist">
            <ul className="space-y-2">
              {contentChecklistKeys.map((key) => (
                <ChecklistRow
                  key={key}
                  label={CHECKLIST_LABELS[key as keyof typeof CHECKLIST_LABELS]}
                  checked={Boolean(reviewState?.checklist?.[key])}
                  onChange={(checked) => toggleChecklistItem(key, checked)}
                />
              ))}
            </ul>
            {approveHints.length > 0 && (
              <ul className="mt-3 list-inside list-disc text-xs text-muted-foreground">
                {approveHints.map((msg) => (
                  <li key={msg}>{msg}</li>
                ))}
              </ul>
            )}
          </Section>
        </div>

        {book.versionHistory && book.versionHistory.length > 0 && (
          <div className="mt-6">
            <Section title="Version history">
              <ul className="space-y-3">
                {book.versionHistory.map((v) => (
                  <li key={v.id} className="rounded-lg border border-border px-3 py-2 text-sm">
                    <span className="font-semibold">Version {v.version}</span> — {v.status} —{' '}
                    {formatDate(v.at)}
                    {v.reason && <p className="mt-1 text-red-600">Reason: {v.reason}</p>}
                  </li>
                ))}
              </ul>
            </Section>
          </div>
        )}

        {book.auditTrail && book.auditTrail.length > 0 && (
          <div className="mt-6">
            <Section title="Audit trail">
              <ul className="max-h-64 space-y-2 overflow-y-auto text-sm">
                {book.auditTrail.map((a) => (
                  <li key={a.id} className="border-b border-border/50 pb-2">
                    <span className="font-medium capitalize">{a.action.replace(/_/g, ' ')}</span>
                    <span className="text-muted-foreground"> · {formatDate(a.at)}</span>
                    {a.comments && <p className="text-xs text-muted-foreground">{a.comments}</p>}
                  </li>
                ))}
              </ul>
            </Section>
          </div>
        )}

        <div className="mt-6">
          <Section title="Approval decision">
            {!allChecksComplete && (
              <p className="mb-3 text-sm text-amber-800 dark:text-amber-200">
                Check all verification boxes above to enable <strong>Approve</strong>
                {uncheckedItems.length > 0 && (
                  <span className="mt-1 block text-xs font-normal text-amber-700 dark:text-amber-300">
                    Remaining:{' '}
                    {uncheckedItems
                      .map((key) =>
                        REVENUE_CHECKLIST_LABELS[key] ||
                        CHECKLIST_LABELS[key as keyof typeof CHECKLIST_LABELS] ||
                        key,
                      )
                      .join(' · ')}
                  </span>
                )}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              {['pending_review', 'rejected', 'changes_requested'].includes(book.status) && (
                <button
                  type="button"
                  disabled={acting || !allChecksComplete}
                  onClick={() => setShowApprove(true)}
                  className={approveButtonClass}
                  title={
                    allChecksComplete
                      ? 'Approve and publish this book'
                      : 'Complete all verification checkboxes first'
                  }
                >
                  Approve
                </button>
              )}
              {['pending_review', 'approved', 'changes_requested'].includes(book.status) && (
                <button
                  type="button"
                  disabled={acting}
                  onClick={() => setShowReject(true)}
                  className={rejectButtonClass}
                >
                  Reject
                </button>
              )}
            </div>
          </Section>
        </div>
      </div>

      <ConfirmModal
        open={showApprove}
        title="Approve this book?"
        description="The book will be published in the marketplace. Author and publisher (if any) will be notified."
        confirmLabel="Approve"
        variant="approve"
        loading={acting}
        onClose={() => setShowApprove(false)}
        onConfirm={() => approve()}
      />
      <ConfirmModal
        open={showApproveChanges}
        title="Approve these changes?"
        description="The author's proposed updates will be applied and published. The author will be notified by email."
        confirmLabel="Approve"
        variant="approve"
        loading={acting}
        onClose={() => setShowApproveChanges(false)}
        onConfirm={() => approve({ approveChanges: true })}
      />
      <RejectModal
        open={showReject}
        bookTitle={book.title}
        onClose={() => setShowReject(false)}
        onConfirm={rejectOnly}
        loading={acting}
      />
      <NotifyAuthorModal
        open={showNotify}
        bookTitle={book.title}
        authorName={book.author.publicName}
        authorEmail={book.author.email}
        initialReason={book.reviewMetadata?.reason || book.reviewNote || ''}
        initialAdminNotes={book.reviewMetadata?.adminNotes || ''}
        initialSuggestedFixes={book.reviewMetadata?.suggestedFixes || ''}
        initialSeverity={(book.reviewMetadata?.severity as 'low' | 'medium' | 'high') || 'medium'}
        onClose={() => setShowNotify(false)}
        onConfirm={notifyAuthor}
        loading={acting}
      />
      {authorProfileUserId && (
        <UserDetailPanel
          userId={authorProfileUserId}
          onClose={() => setAuthorProfileUserId(null)}
          onUpdated={() => void loadBook()}
        />
      )}
      {showChanges && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl">
            <h3 className="text-lg font-semibold">Request changes from author</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Your feedback will be emailed to the author. Status becomes &quot;changes requested&quot;.
            </p>
            <textarea
              className="mt-4 w-full rounded-lg border border-border p-3 text-sm"
              rows={5}
              placeholder="Detailed feedback for the author…"
              value={changesFeedback}
              onChange={(e) => setChangesFeedback(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-border px-4 py-2 text-sm"
                onClick={() => setShowChanges(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={acting}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                onClick={requestChanges}
              >
                Send feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
