'use client';

import { Eye, Loader2, Mail, Pencil, Plus, RefreshCw, Send, Trash2, User, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AdminTopHeader } from '@/components/admin-top-header';
import { useToast } from '@/components/toast-provider';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useAdminInvitations } from '@/hooks/useAdminInvitations';
import { getApiErrorMessage } from '@/lib/api-error';
import { CreateInvitationModal } from './create-invitation-modal';
import { EditInvitationModal } from './edit-invitation-modal';
import { PreviewInvitationModal } from './preview-invitation-modal';
import {
  canDeleteInvitation,
  canEditInvitation,
  canResendInvitation,
  canSendInvitation,
  STATUS_LABELS,
} from './invitation-actions';
import { RoleBadge, StatusBadge } from './invitation-badges';
import { applyPlaceholders } from './invitation-templates';
import type { AdminInvitation, InvitationRoleType, InvitationStatus } from './types';
import { UserDetailPanel } from '@/features/users/user-detail-panel';
import type { AdminUserRow } from '@/features/users/types';

const STATUS_FILTERS: { id: InvitationStatus | ''; label: string }[] = [
  { id: '', label: 'All statuses' },
  { id: 'draft', label: STATUS_LABELS.draft },
  { id: 'sent', label: STATUS_LABELS.sent },
  { id: 'accepted', label: STATUS_LABELS.accepted },
  { id: 'expired', label: STATUS_LABELS.expired },
];

const ROLE_FILTERS: { id: InvitationRoleType | ''; label: string }[] = [
  { id: '', label: 'All roles' },
  { id: 'user', label: 'User' },
  { id: 'author', label: 'Author' },
  { id: 'publisher', label: 'Publisher' },
];

export function InvitationsManagement() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [searchInput, setSearchInput] = useState(() => searchParams.get('search') ?? '');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<InvitationStatus | ''>('');
  const [roleFilter, setRoleFilter] = useState<InvitationRoleType | ''>('');
  const [createOpen, setCreateOpen] = useState(false);
  const [previewInvite, setPreviewInvite] = useState<AdminInvitation | null>(null);
  const [editInvite, setEditInvite] = useState<AdminInvitation | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminInvitation | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userLookupLoading, setUserLookupLoading] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(searchInput, 400);
  const { invitations, pagination, loading, error, refetch } = useAdminInvitations({
    page,
    limit: 10,
    search: debouncedSearch,
    status: statusFilter,
    roleType: roleFilter,
  });

  useEffect(() => {
    if (page > pagination.totalPages && pagination.totalPages > 0) {
      setPage(pagination.totalPages);
    }
  }, [page, pagination.totalPages]);

  const runAction = async (id: string, path: string, fallbackMsg: string) => {
    setActionLoading(id + path);
    try {
      const res = await fetch(`/api/admin/invitations/${id}/${path}`, {
        method: 'POST',
        credentials: 'include',
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(getApiErrorMessage(payload, 'Action failed'));
      }
      toast(payload.message || fallbackMsg, 'success');
      refetch();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Action failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(deleteTarget.id + 'delete');
    try {
      const res = await fetch(`/api/admin/invitations/${deleteTarget.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(getApiErrorMessage(payload, 'Delete failed'));
      }
      toast('Invitation deleted', 'success');
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Delete failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const openAcceptedUser = async (inv: AdminInvitation) => {
    if (inv.status !== 'accepted') return;
    setUserLookupLoading(inv.id);
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '20',
        search: inv.recipientEmail.trim(),
      });
      const res = await fetch(`/api/admin/users?${params}`, { credentials: 'include', cache: 'no-store' });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(getApiErrorMessage(payload, 'Failed to find user'));
      }
      const items = (payload.data?.items ?? []) as AdminUserRow[];
      const match = items.find(
        (u) => u.email.trim().toLowerCase() === inv.recipientEmail.trim().toLowerCase(),
      );
      if (!match) {
        throw new Error('User account not found. They may have registered with a different email.');
      }
      setSelectedUserId(match.id);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to open user profile', 'error');
    } finally {
      setUserLookupLoading(null);
    }
  };

  const start = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const end = Math.min(pagination.page * pagination.limit, pagination.total);

  const activeStatusLabel = statusFilter ? STATUS_LABELS[statusFilter] : null;

  return (
    <div className="min-h-screen bg-background">
      <AdminTopHeader
        searchValue={searchInput}
        onSearchChange={(value) => {
          setSearchInput(value);
          setPage(1);
        }}
        searchPlaceholder="Search invitations by name or email..."
        adminSubtitle="Invitations"
      />

      <div className="px-8 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Invitation Management
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Invite users, authors, and publishers with customized emails. Save as draft or send
              immediately, then track through acceptance.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-primary/90"
          >
            <UserPlus size={18} />
            New Invitation
          </button>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
            <p>{error}</p>
            {(error.includes('admin_invitations') || error.includes('table is missing')) && (
              <ol className="mt-3 list-decimal space-y-1 pl-5 text-red-900/90 dark:text-red-100">
                <li>
                  Open{' '}
                  <a
                    href="https://supabase.com/dashboard/project/usafbxivbynfdrcrqqdf/sql/new"
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold underline"
                  >
                    Supabase SQL Editor
                  </a>
                </li>
                <li>
                  Paste and run{' '}
                  <code className="rounded bg-red-100 px-1 dark:bg-red-900">
                    Book-Nest-WebApp/backend/scripts/admin-invitations.sql
                  </code>
                </li>
                <li>Refresh this page</li>
              </ol>
            )}
            <button type="button" className="mt-2 font-semibold underline" onClick={() => refetch()}>
              Retry
            </button>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id || 'all'}
              type="button"
              onClick={() => {
                setPage(1);
                setStatusFilter(f.id);
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                statusFilter === f.id
                  ? 'bg-primary text-white'
                  : 'border border-border text-muted dark:border-border'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {ROLE_FILTERS.map((f) => (
            <button
              key={f.id || 'all'}
              type="button"
              onClick={() => {
                setPage(1);
                setRoleFilter(f.id);
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                roleFilter === f.id
                  ? 'bg-primary text-white'
                  : 'border border-border text-muted dark:border-border'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-6 py-4 dark:border-border">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted">Invitations</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-accent hover:bg-surface dark:border-border"
              >
                <RefreshCw size={14} />
                Refresh
              </button>
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90"
              >
                <Plus size={14} />
                Add invitation
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface/80 text-[10px] font-bold uppercase tracking-wider text-muted dark:border-border dark:bg-surface/50">
                  <th className="px-6 py-4">Recipient</th>
                  <th className="px-4 py-4">Role</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Expires</th>
                  <th className="px-4 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading &&
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      <td colSpan={5} className="px-6 py-8">
                        <div className="h-4 animate-pulse rounded bg-border dark:bg-border" />
                      </td>
                    </tr>
                  ))}
                {!loading && invitations.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <Mail className="mx-auto text-muted" size={40} />
                      <p className="mt-3 font-medium text-muted">
                        {activeStatusLabel
                          ? `No ${activeStatusLabel.toLowerCase()} invitations`
                          : 'No invitations yet'}
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        {activeStatusLabel
                          ? 'Try another status filter or create a new invitation.'
                          : 'Create your first invitation to onboard users to BookNest.'}
                      </p>
                      {!activeStatusLabel && (
                        <button
                          type="button"
                          onClick={() => setCreateOpen(true)}
                          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
                        >
                          <UserPlus size={16} />
                          New Invitation
                        </button>
                      )}
                    </td>
                  </tr>
                )}
                {!loading &&
                  invitations.map((inv) => (
                    <tr
                      key={inv.id}
                      className="border-b border-border hover:bg-surface/50 dark:border-border dark:hover:bg-primary/90/30"
                    >
                      <td className="px-6 py-4">
                        {inv.status === 'accepted' ? (
                          <button
                            type="button"
                            onClick={() => openAcceptedUser(inv)}
                            disabled={userLookupLoading === inv.id}
                            className="group text-left disabled:opacity-60"
                          >
                            <p className="font-semibold text-accent group-hover:underline dark:text-indigo-400">
                              {inv.recipientName}
                            </p>
                            <p className="text-xs text-muted group-hover:text-accent">
                              {inv.recipientEmail}
                            </p>
                            {inv.acceptedAt && (
                              <p className="mt-0.5 text-[10px] text-emerald-600">
                                Accepted {new Date(inv.acceptedAt).toLocaleDateString()}
                              </p>
                            )}
                          </button>
                        ) : (
                          <>
                            <p className="font-semibold text-foreground">{inv.recipientName}</p>
                            <p className="text-xs text-muted">{inv.recipientEmail}</p>
                          </>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <RoleBadge roleType={inv.roleType} />
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={inv.status} />
                      </td>
                      <td className="px-4 py-4 text-xs text-muted">
                        {new Date(inv.expiresAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          <button
                            type="button"
                            title="Preview"
                            onClick={() => setPreviewInvite(inv)}
                            className="rounded-lg p-2 text-muted hover:bg-surface"
                          >
                            <Eye size={14} />
                          </button>
                          {inv.status === 'accepted' && (
                            <button
                              type="button"
                              title="View user profile"
                              disabled={userLookupLoading === inv.id}
                              onClick={() => openAcceptedUser(inv)}
                              className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50"
                            >
                              {userLookupLoading === inv.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <User size={14} />
                              )}
                            </button>
                          )}
                          {canEditInvitation(inv.status) && (
                            <button
                              type="button"
                              title="Edit"
                              onClick={() => setEditInvite(inv)}
                              className="rounded-lg p-2 text-accent hover:bg-surface"
                            >
                              <Pencil size={14} />
                            </button>
                          )}
                          {canSendInvitation(inv.status, inv.sentAt) && (
                            <button
                              type="button"
                              title="Send email"
                              disabled={!!actionLoading}
                              onClick={() =>
                                runAction(inv.id, 'send', `Email sent to ${inv.recipientEmail}`)
                              }
                              className="rounded-lg p-2 text-accent hover:bg-surface"
                            >
                              {actionLoading === inv.id + 'send' ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Send size={14} />
                              )}
                            </button>
                          )}
                          {canResendInvitation(inv.status, inv.sentAt) && (
                            <button
                              type="button"
                              title="Resend email"
                              disabled={!!actionLoading}
                              onClick={() =>
                                runAction(inv.id, 'resend', `Email resent to ${inv.recipientEmail}`)
                              }
                              className="rounded-lg p-2 text-sky-600 hover:bg-sky-50"
                            >
                              {actionLoading === inv.id + 'resend' ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <RefreshCw size={14} />
                              )}
                            </button>
                          )}
                          {canDeleteInvitation(inv.status) && (
                            <button
                              type="button"
                              title="Delete"
                              onClick={() => setDeleteTarget(inv)}
                              className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {pagination.total > 0 && (
            <div className="flex flex-col gap-3 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-border">
              <p className="text-xs text-muted">
                Showing {start} to {end} of {pagination.total}
              </p>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border px-3 py-1.5 text-xs disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  type="button"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border px-3 py-1.5 text-xs disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="mt-6 text-sm text-muted">
          Also manage users from{' '}
          <Link href="/dashboard/users" className="font-semibold text-accent hover:underline">
            User Management
          </Link>
          .
        </p>
      </div>

      <CreateInvitationModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(viewStatus) => {
          if (viewStatus) {
            setPage(1);
            setStatusFilter(viewStatus);
          } else {
            refetch();
          }
        }}
      />

      <EditInvitationModal
        invitation={editInvite}
        onClose={() => setEditInvite(null)}
        onSaved={refetch}
      />

      {previewInvite && (
        <PreviewInvitationModal
          open={!!previewInvite}
          onClose={() => setPreviewInvite(null)}
          recipientName={previewInvite.recipientName}
          recipientEmail={previewInvite.recipientEmail}
          roleType={previewInvite.roleType}
          subject={previewInvite.subject}
          message={applyPlaceholders(previewInvite.message, {
            name: previewInvite.recipientName,
            expiresAt: previewInvite.expiresAt,
          })}
          expiresAt={previewInvite.expiresAt}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-card p-6 shadow-xl dark:bg-primary">
            <h3 className="text-lg font-bold text-foreground">Delete invitation?</h3>
            <p className="mt-2 text-sm text-muted">
              Remove invitation for <strong>{deleteTarget.recipientEmail}</strong>? This cannot be
              undone.
              {deleteTarget.status === 'accepted' && (
                <>
                  {' '}
                  The user&apos;s account will <strong>not</strong> be deleted — only this
                  invitation record is removed from the list.
                </>
              )}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border px-4 py-2 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!!actionLoading}
                onClick={confirmDelete}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <UserDetailPanel
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
        onUpdated={() => {}}
      />
    </div>
  );
}
