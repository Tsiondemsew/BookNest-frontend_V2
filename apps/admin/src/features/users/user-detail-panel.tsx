'use client';

import Link from 'next/link';
import { Ban, BookOpen, CheckCircle2, ChevronRight, Loader2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { getApiErrorMessage } from '@/lib/api-error';
import { BanUserModal } from './ban-user-modal';
import { VerificationBadge } from './verification-badge';
import type { AdminUserDetail, AdminUserRow, UserBookSummary, UserProfileDetail } from './types';

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-zinc-100 py-3 text-sm dark:border-zinc-800">
      <span className="text-zinc-500">{label}</span>
      <span className="text-right font-medium text-zinc-900 dark:text-white">{value}</span>
    </div>
  );
}

function ProfileSection({ profile }: { profile: UserProfileDetail }) {
  return (
    <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-700 dark:bg-zinc-800/40">
      <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
        {profile.type} profile
      </p>
      <div className="mt-3 space-y-0">
        {profile.type === 'reader' && (
          <>
            {profile.displayName && <DetailRow label="Display name" value={profile.displayName} />}
            {profile.bio && <DetailRow label="Bio" value={profile.bio} />}
          </>
        )}
        {profile.type === 'author' && (
          <>
            {profile.penName && <DetailRow label="Pen name" value={profile.penName} />}
            {profile.fullName && <DetailRow label="Full name" value={profile.fullName} />}
            {profile.websiteUrl && (
              <DetailRow
                label="Website"
                value={
                  <a
                    href={profile.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline"
                  >
                    {profile.websiteUrl}
                  </a>
                }
              />
            )}
            {profile.bio && <DetailRow label="Bio" value={profile.bio} />}
          </>
        )}
        {profile.type === 'publisher' && (
          <>
            {profile.companyName && <DetailRow label="Company" value={profile.companyName} />}
            {profile.supportEmail && <DetailRow label="Support email" value={profile.supportEmail} />}
            {profile.websiteUrl && (
              <DetailRow
                label="Website"
                value={
                  <a
                    href={profile.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline"
                  >
                    {profile.websiteUrl}
                  </a>
                }
              />
            )}
            {profile.bio && <DetailRow label="Bio" value={profile.bio} />}
          </>
        )}
        {profile.type === 'admin' && (
          <>
            {profile.displayName && <DetailRow label="Display name" value={profile.displayName} />}
            {profile.bio && <DetailRow label="Bio" value={profile.bio} />}
          </>
        )}
      </div>
    </div>
  );
}

const BOOK_STATUS_STYLES: Record<string, string> = {
  pending_review: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  draft: 'bg-zinc-100 text-zinc-600',
  archived: 'bg-zinc-100 text-zinc-500',
};

function BookStatusBadge({ status }: { status: string }) {
  const label = status.replace(/_/g, ' ');
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${BOOK_STATUS_STYLES[status] ?? 'bg-zinc-100 text-zinc-600'}`}
    >
      {label}
    </span>
  );
}

function UserBookRow({ book, onNavigate }: { book: UserBookSummary; onNavigate: () => void }) {
  return (
    <Link
      href={`/dashboard/books/${book.id}?returnTo=/dashboard/users`}
      onClick={onNavigate}
      className="flex items-center gap-3 rounded-xl border border-zinc-100 p-3 transition hover:border-indigo-200 hover:bg-indigo-50/50 dark:border-zinc-800 dark:hover:border-indigo-900 dark:hover:bg-indigo-950/20"
    >
      {book.coverImageUrl ? (
        <img src={book.coverImageUrl} alt="" className="h-14 w-10 shrink-0 rounded-lg object-cover" />
      ) : (
        <div className="flex h-14 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white">
          {book.title.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-zinc-900 dark:text-white">{book.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <BookStatusBadge status={book.status} />
          {book.genre && <span className="text-xs text-zinc-500">{book.genre}</span>}
        </div>
        <p className="mt-0.5 text-xs text-zinc-400">Updated {book.updatedLabel}</p>
      </div>
      <ChevronRight size={18} className="shrink-0 text-zinc-400" />
    </Link>
  );
}

export function UserDetailPanel({
  userId,
  onClose,
  onUpdated,
}: {
  userId: string | null;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [banOpen, setBanOpen] = useState(false);
  const [statusDraft, setStatusDraft] = useState('active');
  const [reasonDraft, setReasonDraft] = useState('');

  const loadDetail = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { credentials: 'include' });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(getApiErrorMessage(payload, 'Failed to load user'));
      }
      const data = payload.data as AdminUserDetail;
      setDetail(data);
      setStatusDraft(data.accountStatus === 'active' ? 'active' : data.accountStatus);
      setReasonDraft(data.banReason || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user');
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) loadDetail();
    else setDetail(null);
  }, [userId, loadDetail]);

  const handleApprove = async () => {
    if (!userId || !detail) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(getApiErrorMessage(payload, 'Failed to approve user'));
      }
      await loadDetail();
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBan = async (reason: string) => {
    if (!userId) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(getApiErrorMessage(payload, 'Failed to ban user'));
      }
      setBanOpen(false);
      await loadDetail();
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to ban user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!userId || !detail) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountStatus: statusDraft,
          reason: statusDraft === 'active' ? undefined : reasonDraft,
        }),
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(getApiErrorMessage(payload, 'Failed to update status'));
      }
      await loadDetail();
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  if (!userId) return null;

  const isBanned = detail?.systemStatus === 'banned';
  const isAdmin = detail?.role === 'admin';
  const isReader = detail?.role === 'reader';
  const isAuthorOrPublisher = detail?.role === 'author' || detail?.role === 'publisher';
  const books = detail?.books ?? [];
  const showBooks = isAuthorOrPublisher;
  const isPendingVerification = detail?.verificationStatus === 'pending';
  const isApprovedAccount = !isBanned && detail?.verificationStatus === 'verified';
  const showBanForCreator = isAuthorOrPublisher && !isBanned;
  const showApproveForCreator = isAuthorOrPublisher && (isBanned || isPendingVerification);
  const statusChanged =
    detail &&
    (statusDraft !== (detail.accountStatus === 'active' ? 'active' : detail.accountStatus) ||
      (statusDraft !== 'active' && reasonDraft !== (detail.banReason || '')));

  return (
    <>
      <div className="fixed inset-0 z-40 flex justify-end">
        <button type="button" className="absolute inset-0 bg-black/30" aria-label="Close panel" onClick={onClose} />
        <aside className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">User Details</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {loading && (
              <div className="flex items-center justify-center py-16 text-zinc-500">
                <Loader2 className="animate-spin" size={24} />
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {!loading && detail && (
              <>
                <div className="flex items-center gap-4">
                  {detail.avatarUrl ? (
                    <img src={detail.avatarUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-bold text-white">
                      {detail.initials}
                    </div>
                  )}
                  <div>
                    <p className="text-xl font-bold text-zinc-900 dark:text-white">{detail.name}</p>
                    <p className="text-sm text-zinc-500">{detail.email}</p>
                    <p className="mt-1 capitalize text-xs font-semibold text-indigo-600">{detail.role}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <DetailRow
                    label="Verification"
                    value={<VerificationBadge status={detail.verificationStatus} />}
                  />
                  <DetailRow
                    label="System status"
                    value={
                      <span className={isBanned ? 'text-red-600' : 'text-emerald-600'}>
                        {isBanned ? 'Banned' : 'Active'}
                      </span>
                    }
                  />
                  <DetailRow label="Member since" value={detail.memberSince} />
                  <DetailRow label="Last activity" value={detail.lastActivity} />
                  {showBooks && (
                    <DetailRow label="Catalog books" value={String(detail.bookCount)} />
                  )}
                </div>

                {detail.profile ? (
                  <ProfileSection profile={detail.profile} />
                ) : (
                  <div className="mt-6 rounded-xl border border-dashed border-zinc-200 px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
                    No profile submitted yet for this {detail.role}.
                  </div>
                )}

                {detail.banReason && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
                    <p className="text-xs font-bold uppercase tracking-wider text-red-600">Ban reason</p>
                    <p className="mt-2 text-sm text-red-800 dark:text-red-200">{detail.banReason}</p>
                    {detail.statusUpdatedAt && (
                      <p className="mt-2 text-xs text-red-600/80">
                        Updated {new Date(detail.statusUpdatedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                {!isAdmin && (
                  <div className="mt-6 rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Change account status</p>
                    <select
                      value={statusDraft}
                      onChange={(e) => setStatusDraft(e.target.value)}
                      className="mt-3 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended (banned)</option>
                      <option value="disabled">Disabled (banned)</option>
                    </select>
                    {statusDraft !== 'active' && (
                      <textarea
                        value={reasonDraft}
                        onChange={(e) => setReasonDraft(e.target.value)}
                        placeholder={
                          detail.role === 'author'
                            ? 'Ban reason (required, min 5 characters for authors)'
                            : 'Reason for status change (optional)'
                        }
                        rows={3}
                        className="mt-3 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                      />
                    )}
                    <button
                      type="button"
                      disabled={actionLoading || !statusChanged}
                      onClick={handleStatusUpdate}
                      className="mt-3 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {actionLoading ? 'Saving…' : 'Apply status change'}
                    </button>
                  </div>
                )}

                {showBooks && (
                  <div className="mt-8">
                    <div className="mb-3 flex items-center gap-2">
                      <BookOpen size={16} className="text-indigo-600" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
                        Submitted books ({books.length})
                      </h3>
                    </div>
                    {books.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-zinc-200 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
                        No books linked to this user.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {books.map((book) => (
                          <UserBookRow key={book.id} book={book} onNavigate={onClose} />
                        ))}
                      </div>
                    )}
                    {books.length > 0 && (
                      <p className="mt-3 text-xs text-zinc-500">
                        Open a book to review, approve, reject, or notify the author.
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {!loading && detail && isReader && !isBanned && (
            <div className="border-t border-zinc-200 p-6 dark:border-zinc-800">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Quick actions</p>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setBanOpen(true)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                <Ban size={18} />
                Ban reader
              </button>
            </div>
          )}

          {!loading && detail && isAuthorOrPublisher && (showBanForCreator || showApproveForCreator) && (
            <div className="border-t border-zinc-200 p-6 dark:border-zinc-800">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">Quick actions</p>
              <div className="flex gap-3">
                {showBanForCreator && (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => setBanOpen(true)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    <Ban size={18} />
                    Ban {detail.role}
                  </button>
                )}
                {showApproveForCreator && (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleApprove}
                    className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white disabled:opacity-50 ${
                      showBanForCreator
                        ? 'border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    <CheckCircle2 size={18} />
                    {actionLoading
                      ? 'Approving…'
                      : isBanned
                        ? 'Approve / Restore'
                        : 'Approve account'}
                  </button>
                )}
              </div>
              {isApprovedAccount && (
                <p className="mt-2 text-xs text-zinc-500">Verified account — ban only if access should be revoked.</p>
              )}
              {isPendingVerification && !isBanned && (
                <p className="mt-2 text-xs text-zinc-500">Pending verification — approve or ban this account.</p>
              )}
            </div>
          )}

          {!loading && detail && isAdmin && (
            <div className="border-t border-zinc-200 p-6 text-sm text-zinc-500 dark:border-zinc-800">
              Admin accounts cannot be banned from this panel.
            </div>
          )}
        </aside>
      </div>

      <BanUserModal
        open={banOpen}
        userName={detail?.name ?? ''}
        userRole={detail?.role ?? 'reader'}
        onClose={() => setBanOpen(false)}
        onConfirm={handleBan}
        loading={actionLoading}
      />
    </>
  );
}

export type { AdminUserRow };
