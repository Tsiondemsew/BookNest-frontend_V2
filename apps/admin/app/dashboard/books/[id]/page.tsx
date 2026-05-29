'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ConfirmModal } from '@/components/moderation/confirm-modal';
import { StatusBadge } from '@/components/moderation/status-badge';
import { AdminProfileChip } from '@/components/admin-profile-chip';
import { getApiErrorMessage } from '@/lib/api-error';
import { authorNotificationToast } from '@/lib/author-notification-toast';
import { useToast } from '@/components/toast-provider';
import { useTheme } from '@/components/theme-provider';
import { RejectModal } from '@/features/books/reject-modal';
import { NotifyAuthorModal } from '@/features/books/notify-author-modal';
import { ChangeDetailPanel } from '@/features/books/change-detail-panel';
import type { PendingBook } from '@/features/books/types';

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function splitChapters(description: string | null): { title: string; body: string }[] {
  if (!description?.trim()) {
    return [{ title: 'Overview', body: 'No content available for this submission.' }];
  }
  const parts = description.split(/\n\s*\n/).filter((p) => p.trim());
  if (parts.length <= 1) {
    return [{ title: 'Full text', body: description.trim() }];
  }
  return parts.map((body, i) => ({
    title: `Section ${i + 1}`,
    body: body.trim(),
  }));
}

export default function AdminBookDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const readerMode = searchParams.get('reader') === '1';
  const returnTo = searchParams.get('returnTo') || '/dashboard/books';
  const backLabel = returnTo.includes('/users') ? '← User management' : '← Moderation';
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const [book, setBook] = useState<PendingBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState(false);
  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [showNotify, setShowNotify] = useState(false);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});

  const chapters = useMemo(() => splitChapters(book?.description ?? null), [book?.description]);
  const progress = chapters.length ? ((chapterIndex + 1) / chapters.length) * 100 : 0;

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

  const approve = async () => {
    if (!book) return;
    setActing(true);
    try {
      const res = await fetch(`/api/admin/books/${book.id}/approve`, {
        method: 'POST',
        credentials: 'include',
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) throw new Error(getApiErrorMessage(payload, 'Approve failed'));
      toast('Book approved.', 'success');
      await loadBook();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed', 'error');
    } finally {
      setActing(false);
      setShowApprove(false);
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
        body: JSON.stringify({ ...body, notify: false }),
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) throw new Error(getApiErrorMessage(payload, 'Reject failed'));
      setBook((prev) =>
        prev
          ? {
              ...prev,
              status: 'rejected',
              reviewNote: body.reason,
              reviewMetadata: {
                reason: body.reason,
                adminNotes: body.adminNotes ?? null,
                suggestedFixes: body.suggestedFixes ?? null,
                severity: body.severity ?? 'medium',
              },
            }
          : prev,
      );
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

  const canReject =
    book?.status === 'pending_review' || book?.status === 'approved';
  const canNotify = book?.status === 'rejected';

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="p-8">
        <p className="text-red-600">{error || 'Book not found'}</p>
        <Link href="/dashboard/books" className="mt-4 inline-block text-indigo-600">
          ← Queue
        </Link>
      </div>
    );
  }

  if (readerMode) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
        <header className="sticky top-0 z-20 border-b bg-white/95 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/dashboard/books/${id}`}
              className="text-sm font-medium text-indigo-600"
            >
              ← Details
            </Link>
            <span className="font-semibold dark:text-white">{book.title}</span>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFontSize((f) => Math.max(12, f - 2))}
                className="rounded-lg border px-2 py-1 text-sm dark:border-slate-600"
                aria-label="Decrease font size"
              >
                A−
              </button>
              <button
                type="button"
                onClick={() => setFontSize((f) => Math.min(24, f + 2))}
                className="rounded-lg border px-2 py-1 text-sm dark:border-slate-600"
                aria-label="Increase font size"
              >
                A+
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                className="rounded-lg border px-3 py-1 text-sm dark:border-slate-600"
              >
                {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
            </div>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </header>

        <div className="flex flex-1">
          <nav className="sticky top-[72px] hidden h-[calc(100vh-72px)] w-56 shrink-0 overflow-y-auto border-r p-4 lg:block dark:border-slate-800">
            <p className="text-xs font-bold uppercase text-slate-500">Sections</p>
            <ul className="mt-2 space-y-1">
              {chapters.map((ch, i) => (
                <li key={ch.title}>
                  <button
                    type="button"
                    onClick={() => {
                      setChapterIndex(i);
                      document.getElementById(`section-${i}`)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`w-full rounded-lg px-2 py-1.5 text-left text-sm ${
                      chapterIndex === i
                        ? 'bg-indigo-100 font-semibold text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                  >
                    {ch.title}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <main className="mx-auto max-w-3xl flex-1 scroll-smooth px-4 py-8">
            {chapters.map((ch, i) => (
              <section key={ch.title} id={`section-${i}`} className="mb-10">
                <button
                  type="button"
                  onClick={() => setCollapsed((c) => ({ ...c, [i]: !c[i] }))}
                  className="flex w-full items-center justify-between text-left"
                >
                  <h2 className="text-lg font-semibold dark:text-white">{ch.title}</h2>
                  <span className="text-slate-400">{collapsed[i] ? '▼' : '▲'}</span>
                </button>
                {!collapsed[i] && (
                  <div
                    className="prose mt-4 max-w-none dark:prose-invert"
                    style={{ fontSize: `${fontSize}px`, lineHeight: 1.7 }}
                  >
                    {ch.body.split('\n').map((para, j) => (
                      <p key={j} className="mb-4 text-slate-700 dark:text-slate-300">
                        {para}
                      </p>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </main>
        </div>
      </div>
    );
  }

  const queueStatus =
    book.status === 'approved'
      ? 'approved'
      : book.status === 'rejected'
        ? 'rejected'
        : 'pending_review';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="flex items-center justify-end border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
        <AdminProfileChip subtitle="Moderator" showText={false} className="px-1 py-1" />
      </div>
      <div className="p-4 sm:p-8">
      <Link
        href={returnTo}
        className="text-sm font-medium text-indigo-600 hover:underline"
      >
        {backLabel}
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[280px_1fr]">
        <div>
          {book.coverImageUrl ? (
            <img
              src={book.coverImageUrl}
              alt=""
              className="w-full rounded-2xl shadow-lg ring-1 ring-slate-200 dark:ring-slate-700"
            />
          ) : (
            <div className="flex aspect-[2/3] items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-4xl font-bold text-white">
              {book.title.charAt(0)}
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusBadge book={book} queueStatus={queueStatus} />
            <Link
              href={`/dashboard/books/${id}?reader=1`}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Open reader
            </Link>
          </div>
        </div>

        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold dark:text-white">
            {book.title}
          </h1>
          {book.subtitle && (
            <p className="mt-1 text-lg text-slate-500">{book.subtitle}</p>
          )}

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <InfoCard title="Book info">
              <InfoRow label="Genre" value={book.genre} />
              <InfoRow label="Language" value={book.language} />
              <InfoRow label="ISBN" value={book.isbn} />
              <InfoRow label="Status" value={book.status} />
              <InfoRow label="Uploaded" value={formatDate(book.submittedAt)} />
              <InfoRow label="Sections" value={String(book.chapterCount ?? chapters.length)} />
            </InfoCard>

            <InfoCard title="Author">
              <InfoRow label="Name" value={book.authorProfile?.name || book.author.publicName} />
              <InfoRow label="Email" value={book.authorProfile?.email || book.author.email} />
              <InfoRow
                label="Published books"
                value={String(book.authorProfile?.publishedBooksCount ?? '—')}
              />
              <InfoRow
                label="Member since"
                value={formatDate(book.authorProfile?.memberSince)}
              />
            </InfoCard>

            <InfoCard title="Stats">
              <InfoRow label="Views" value={String(book.stats?.views ?? 0)} />
              <InfoRow label="Favorites" value={String(book.stats?.favorites ?? 0)} />
              <InfoRow
                label="Est. reading time"
                value={`${book.stats?.readingTimeMinutes ?? '—'} min`}
              />
              <InfoRow label="Chapters" value={String(book.stats?.totalChapters ?? chapters.length)} />
            </InfoCard>

            {(book.approvedAt || book.rejectedAt) && (
              <InfoCard title="Review">
                {book.approvedAt && (
                  <InfoRow label="Approved" value={formatDate(book.approvedAt)} />
                )}
                {book.approvedBy && (
                  <InfoRow label="Approved by" value={book.approvedBy.email} />
                )}
                {book.rejectedAt && (
                  <InfoRow label="Rejected" value={formatDate(book.rejectedAt)} />
                )}
                {book.reviewNote && (
                  <p className="mt-2 text-sm text-red-700 dark:text-red-300">{book.reviewNote}</p>
                )}
              </InfoCard>
            )}
          </div>

          <div id="changes" className="mt-6 scroll-mt-24">
            <ChangeDetailPanel book={book} />
          </div>

          {book.activity && book.activity.length > 0 && (
            <div className="mt-6 rounded-2xl border bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
              <h2 className="font-semibold dark:text-white">Moderation activity</h2>
              <ul className="mt-4 space-y-4 border-l-2 border-indigo-200 pl-4 dark:border-indigo-800">
                {book.activity.map((a) => (
                  <li key={a.id} className="relative text-sm">
                    <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-indigo-500" />
                    <p className="capitalize dark:text-slate-200">{a.message}</p>
                    <p className="text-xs text-slate-400">{formatDate(a.at)}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 rounded-2xl border bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <h2 className="font-semibold dark:text-white">Description</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-400">
              {book.description || 'No description.'}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {canReject && (
              <button
                type="button"
                onClick={() => setShowReject(true)}
                className="rounded-xl border-2 border-red-200 px-6 py-2.5 text-sm font-semibold text-red-600"
              >
                Reject
              </button>
            )}
            {canNotify && (
              <button
                type="button"
                onClick={() => setShowNotify(true)}
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md"
              >
                Notify
              </button>
            )}
            {['pending_review', 'rejected'].includes(book.status) && (
              <button
                type="button"
                onClick={() => setShowApprove(true)}
                className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md"
              >
                Approve
              </button>
            )}
          </div>
        </div>
      </div>
      </div>

      <ConfirmModal
        open={showApprove}
        title="Approve this book?"
        description="The book will be published and the author notified."
        confirmLabel="Approve"
        loading={acting}
        onClose={() => setShowApprove(false)}
        onConfirm={approve}
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
        initialSeverity={
          (book.reviewMetadata?.severity as 'low' | 'medium' | 'high') || 'medium'
        }
        onClose={() => setShowNotify(false)}
        onConfirm={notifyAuthor}
        loading={acting}
      />
    </div>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</h3>
      <div className="mt-3 space-y-2">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900 dark:text-slate-200">{value || '—'}</span>
    </div>
  );
}
