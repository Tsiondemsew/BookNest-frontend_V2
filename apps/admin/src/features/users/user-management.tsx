'use client';

import Link from 'next/link';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  UserPlus,
  Users,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AdminTopHeader } from '@/components/admin-top-header';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { ExportUsersModal, type UserRoleFilter } from './export-users-modal';
import { UserDetailPanel } from './user-detail-panel';
import { RecentAdminTasks } from './recent-admin-tasks';
import { VerificationBadge } from './verification-badge';
import type { AdminUserRow, UserSegmentFilter } from './types';

const ROLE_FILTERS: { id: UserRoleFilter; label: string }[] = [
  { id: '', label: 'All Roles' },
  { id: 'reader', label: 'Readers' },
  { id: 'author', label: 'Authors' },
  { id: 'publisher', label: 'Publishers' },
  { id: 'admin', label: 'Admins' },
];

const SEGMENT_LABELS: Record<Exclude<UserSegmentFilter, 'all'>, string> = {
  verified_authors: 'Verified authors',
  banned: 'Banned accounts',
  pending: 'Pending verification',
};

function KpiCard({
  label,
  value,
  badge,
  badgeClass,
  icon,
  iconBg,
  active,
  showClearHint,
  onClick,
}: {
  label: string;
  value: number | string;
  badge: string;
  badgeClass: string;
  icon: React.ReactNode;
  iconBg: string;
  active?: boolean;
  showClearHint?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border p-5 text-left shadow-sm transition hover:shadow-md ${
        active
          ? 'border-accent bg-surface ring-2 ring-accent/20'
          : 'border-border bg-card hover:border-accent/30'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className={`rounded-xl p-2.5 ${iconBg}`}>{icon}</div>
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badgeClass}`}>
          {badge}
        </span>
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 text-3xl font-bold text-foreground">{value}</p>
      {active && showClearHint && (
        <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-accent">
          Filter active
        </p>
      )}
    </button>
  );
}

function SystemStatusBadge({ status }: { status: AdminUserRow['systemStatus'] }) {
  if (status === 'banned') {
    return (
      <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-red-700 dark:bg-red-950/50 dark:text-red-300">
        Banned
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">
      Active
    </span>
  );
}

function UserAvatar({ user }: { user: AdminUserRow }) {
  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt=""
        className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm"
      />
    );
  }
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-white shadow-sm">
      {user.initials}
    </div>
  );
}

export function UserManagement() {
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(() => searchParams.get('search') ?? '');
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<UserRoleFilter>('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [segmentFilter, setSegmentFilter] = useState<UserSegmentFilter>('all');
  const debouncedSearch = useDebouncedValue(searchInput, 400);

  const { stats, users, pagination, statsLoading, listLoading, error, refetch, fetchUsers } =
    useAdminUsers({
      page,
      limit: 10,
      search: debouncedSearch,
      role: roleFilter,
      segment: segmentFilter,
    });

  const handleSegmentClick = (segment: UserSegmentFilter) => {
    const nextRole =
      segment === 'verified_authors' && roleFilter && roleFilter !== 'author' ? '' : roleFilter;

    setPage(1);
    setSegmentFilter(segment);
    if (nextRole !== roleFilter) {
      setRoleFilter(nextRole);
    }

    fetchUsers({ page: 1, segment, role: nextRole, search: debouncedSearch });
  };

  useEffect(() => {
    const role = searchParams.get('role');
    if (role === 'reader' || role === 'author' || role === 'publisher' || role === 'admin') {
      setRoleFilter(role);
    }
  }, [searchParams]);

  const onSearchChange = (value: string) => {
    setSearchInput(value);
    setPage(1);
  };

  useEffect(() => {
    if (page > pagination.totalPages && pagination.totalPages > 0) {
      setPage(pagination.totalPages);
    }
  }, [page, pagination.totalPages]);

  const start = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const end = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="min-h-screen bg-background">
      <AdminTopHeader
        searchValue={searchInput}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search users by name or email…"
        adminSubtitle="System Superuser"
      />

      <div className="px-8 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              User Management
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Monitor and control system access for all registered authors, readers, and staff
              members.
            </p>
          </div>
          <Link
            href="/dashboard/invitations"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-primary/90"
          >
            <UserPlus size={18} />
            New Invitation
          </Link>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
            <button type="button" className="ml-2 font-semibold underline" onClick={() => refetch()}>
              Retry
            </button>
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Total Users"
            value={statsLoading && !stats ? '—' : (stats?.totalUsers ?? 0).toLocaleString()}
            badge="+12%"
            badgeClass="bg-emerald-100 text-emerald-700"
            icon={<Users size={20} className="text-accent" />}
            iconBg="bg-surface"
            active={segmentFilter === 'all'}
            onClick={() => handleSegmentClick('all')}
          />
          <KpiCard
            label="Verified Authors"
            value={statsLoading && !stats ? '—' : (stats?.verifiedAuthors ?? 0).toLocaleString()}
            badge={`${stats?.verifiedPercent ?? 0}% verified`}
            badgeClass="bg-sky-100 text-sky-700"
            icon={<CheckCircle2 size={20} className="text-emerald-600" />}
            iconBg="bg-emerald-50"
            active={segmentFilter === 'verified_authors'}
            showClearHint
            onClick={() => handleSegmentClick('verified_authors')}
          />
          <KpiCard
            label="Banned Accounts"
            value={statsLoading && !stats ? '—' : (stats?.bannedAccounts ?? 0).toLocaleString()}
            badge="High Priority"
            badgeClass="bg-red-100 text-red-600"
            icon={<AlertTriangle size={20} className="text-red-600" />}
            iconBg="bg-red-50"
            active={segmentFilter === 'banned'}
            showClearHint
            onClick={() => handleSegmentClick('banned')}
          />
          <KpiCard
            label="Pending Invitations"
            value={statsLoading && !stats ? '—' : (stats?.pendingInvitations ?? 0).toLocaleString()}
            badge="24h Response"
            badgeClass="bg-surface text-accent"
            icon={<Clock size={20} className="text-accent" />}
            iconBg="bg-surface"
            active={segmentFilter === 'pending'}
            showClearHint
            onClick={() => handleSegmentClick('pending')}
          />
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4 dark:border-border">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted">
                Active User Directory
                {listLoading && (
                  <span className="ml-2 inline-flex items-center text-[10px] font-normal normal-case text-accent">
                    Updating…
                  </span>
                )}
              </h2>
              {segmentFilter !== 'all' && (
                <p className="mt-1 text-xs text-accent">
                  Showing: {SEGMENT_LABELS[segmentFilter]}
                  <button
                    type="button"
                    onClick={() => handleSegmentClick('all')}
                    className="ml-2 font-semibold underline"
                  >
                    Clear
                  </button>
                </p>
              )}
              {debouncedSearch.trim() && (
                <p className="mt-1 text-xs text-muted">
                  Search: &ldquo;{debouncedSearch.trim()}&rdquo;
                  {listLoading ? ' — searching…' : ` — ${pagination.total} result${pagination.total === 1 ? '' : 's'}`}
                  <button
                    type="button"
                    onClick={() => onSearchChange('')}
                    className="ml-2 font-semibold text-accent hover:underline"
                  >
                    Clear
                  </button>
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFiltersOpen((o) => !o)}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                  filtersOpen || roleFilter
                    ? 'border-accent/40 bg-surface text-primary dark:border-accent/30 dark:bg-indigo-950/40 dark:text-accent'
                    : 'border-border text-muted hover:bg-surface dark:border-border dark:text-muted'
                }`}
              >
                <Filter size={14} />
                Filters
                {roleFilter && (
                  <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-white">
                    1
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setExportOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted hover:bg-surface dark:border-border dark:text-muted"
              >
                <Download size={14} />
                Export CSV
              </button>
            </div>
          </div>

          {filtersOpen && (
            <div className="border-b border-border px-6 py-4 dark:border-border">
              <p className="text-xs font-bold uppercase tracking-wider text-muted">Filter by role</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {ROLE_FILTERS.map((option) => (
                  <button
                    key={option.id || 'all'}
                    type="button"
                    onClick={() => {
                      setPage(1);
                      setRoleFilter(option.id);
                    }}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                      roleFilter === option.id
                        ? 'bg-primary text-white shadow-md'
                        : 'border border-border bg-surface text-muted hover:bg-surface dark:border-border dark:bg-surface dark:text-muted'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {roleFilter && (
                <button
                  type="button"
                  onClick={() => {
                    setPage(1);
                    setRoleFilter('');
                  }}
                  className="mt-3 text-xs font-semibold text-accent hover:underline"
                >
                  Clear role filter
                </button>
              )}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface/80 text-[10px] font-bold uppercase tracking-wider text-muted dark:border-border dark:bg-surface/50">
                  <th className="px-6 py-4">User Details</th>
                  <th className="px-4 py-4">Verification Status</th>
                  <th className="px-4 py-4">System Status</th>
                  <th className="px-4 py-4">Last Activity</th>
                  <th className="px-4 py-4">Role</th>
                </tr>
              </thead>
              <tbody>
                {listLoading &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      <td colSpan={5} className="px-6 py-6">
                        <div className="h-4 animate-pulse rounded bg-border dark:bg-border" />
                      </td>
                    </tr>
                  ))}

                {!listLoading && users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted">
                      {debouncedSearch.trim()
                        ? `No users match "${debouncedSearch.trim()}". Try a different name or email.`
                        : 'No users found.'}
                    </td>
                  </tr>
                )}

                {!listLoading &&
                  users.map((user) => {
                    const banned = user.systemStatus === 'banned';
                    return (
                      <tr
                        key={user.id}
                        onClick={() => setSelectedUserId(user.id)}
                        className="cursor-pointer border-b border-border transition hover:bg-surface/40 dark:border-border dark:hover:bg-primary/90/30"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <UserAvatar user={user} />
                            <div className={banned ? 'opacity-60 line-through' : ''}>
                              <p className="font-semibold text-foreground">
                                {user.name}
                              </p>
                              <p className="text-xs text-muted">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <VerificationBadge status={user.verificationStatus} />
                        </td>
                        <td className="px-4 py-4">
                          <SystemStatusBadge status={user.systemStatus} />
                          {banned && user.banReason && (
                            <p className="mt-1 max-w-[180px] truncate text-[10px] text-red-500" title={user.banReason}>
                              {user.banReason}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-4 text-muted">
                          {user.lastActivity}
                        </td>
                        <td className="px-4 py-4 capitalize text-muted">
                          {user.role}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-border">
            <p className="text-xs text-muted">
              Showing {start} to {end} of {pagination.total.toLocaleString()} entries
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium disabled:opacity-40 dark:border-border"
              >
                Prev
              </button>
              {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                let pageNum = i + 1;
                if (pagination.totalPages > 5) {
                  if (page <= 3) pageNum = i + 1;
                  else if (page >= pagination.totalPages - 2)
                    pageNum = pagination.totalPages - 4 + i;
                  else pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setPage(pageNum)}
                    className={`min-w-[2rem] rounded-lg px-2 py-1.5 text-xs font-semibold ${
                      pageNum === page
                        ? 'bg-primary text-white'
                        : 'border border-border text-muted hover:bg-surface dark:border-border'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium disabled:opacity-40 dark:border-border"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <RecentAdminTasks onOpenUser={(id) => setSelectedUserId(id)} />

        <footer className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between dark:border-border">
          <p>© {new Date().getFullYear()} LibrarianPro Systems. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-muted">Compliance Center</span>
            <span className="cursor-pointer hover:text-muted">Privacy Policy</span>
            <span className="cursor-pointer hover:text-muted">API Docs</span>
          </div>
        </footer>
      </div>

      <ExportUsersModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        currentPageUsers={users}
        search={debouncedSearch}
        role={roleFilter}
        totalFiltered={pagination.total}
      />

      <UserDetailPanel
        userId={selectedUserId}
        onClose={() => setSelectedUserId(null)}
        onUpdated={() => refetch()}
      />
    </div>
  );
}
