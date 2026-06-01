'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { UserDetailPanel } from '@/features/users/user-detail-panel';
import { VerificationBadge } from '@/features/users/verification-badge';
import type { AdminUserRow } from '@/features/users/types';
import type { UserRoleFilter } from '@/features/users/export-users-modal';
import { OverviewPageShell } from './overview-page-shell';

function SystemStatusBadge({ status }: { status: AdminUserRow['systemStatus'] }) {
  const styles =
    status === 'banned'
      ? 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-200'
      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200';
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${styles}`}>
      {status}
    </span>
  );
}

function UserAvatar({ user }: { user: AdminUserRow }) {
  if (user.avatarUrl) {
    return (
      <img src={user.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover ring-1 ring-border" />
    );
  }
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
      {user.initials}
    </div>
  );
}

function AuthorCard({
  user,
  onClick,
}: {
  user: AdminUserRow;
  onClick: () => void;
}) {
  const banned = user.systemStatus === 'banned';

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col rounded-2xl border border-border bg-card p-5 text-left shadow-sm transition hover:border-primary/40 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <div className="flex items-start gap-3">
        <UserAvatar user={user} />
        <div className={`min-w-0 flex-1 ${banned ? 'opacity-60' : ''}`}>
          <p className="truncate font-semibold text-foreground">{user.name}</p>
          <p className="truncate text-xs text-muted">{user.email}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <VerificationBadge status={user.verificationStatus} />
        <SystemStatusBadge status={user.systemStatus} />
      </div>
      <p className="mt-3 text-xs text-muted">
        Last activity · {user.lastActivity}
      </p>
    </button>
  );
}

const ROLE_CONFIG: Record<
  Exclude<UserRoleFilter, '' | 'admin'>,
  { title: string; description: string; managementHref: string; managementLabel: string }
> = {
  reader: {
    title: 'Readers',
    description: 'All registered reader accounts on BookNest.',
    managementHref: '/dashboard/users',
    managementLabel: 'User management',
  },
  author: {
    title: 'Authors',
    description: 'Authors who publish and submit books for review.',
    managementHref: '/dashboard/users',
    managementLabel: 'User management',
  },
  publisher: {
    title: 'Publishers',
    description: 'Publisher accounts that manage catalog submissions.',
    managementHref: '/dashboard/users',
    managementLabel: 'User management',
  },
};

type Props = {
  role: Exclude<UserRoleFilter, '' | 'admin'>;
};

export function RoleUsersOverview({ role }: Props) {
  const searchParams = useSearchParams();
  const config = ROLE_CONFIG[role];
  const [searchInput, setSearchInput] = useState(() => searchParams.get('search') ?? '');
  const debouncedSearch = useDebouncedValue(searchInput, 400);
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const onSearchChange = (value: string) => {
    setSearchInput(value);
    setPage(1);
  };

  const { users, pagination, listLoading, error, refetch } = useAdminUsers({
    page,
    limit: 15,
    search: debouncedSearch,
    role,
    segment: 'all',
  });

  useEffect(() => {
    if (page > pagination.totalPages && pagination.totalPages > 0) {
      setPage(pagination.totalPages);
    }
  }, [page, pagination.totalPages]);

  const start = pagination.total === 0 ? 0 : (page - 1) * pagination.limit + 1;
  const end = Math.min(page * pagination.limit, pagination.total);

  return (
    <OverviewPageShell
      title={config.title}
      description={config.description}
      secondaryAction={{ label: config.managementLabel, href: config.managementHref }}
      searchValue={searchInput}
      onSearchChange={onSearchChange}
      searchPlaceholder={`Search ${role}s by name or email…`}
    >
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button type="button" className="ml-2 font-semibold underline" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {debouncedSearch.trim() && (
          <div className="border-b border-border px-6 py-3 text-xs text-muted">
            {listLoading
              ? `Searching for "${debouncedSearch.trim()}"…`
              : `${pagination.total} ${role}${pagination.total === 1 ? '' : 's'} matching "${debouncedSearch.trim()}"`}
          </div>
        )}

        {role === 'author' ? (
          <div className="p-6">
            {listLoading && (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-36 animate-pulse rounded-2xl bg-border/60" />
                ))}
              </div>
            )}
            {!listLoading && users.length === 0 && (
              <p className="py-12 text-center text-muted">
                {debouncedSearch.trim()
                  ? `No authors match "${debouncedSearch.trim()}".`
                  : 'No authors found.'}
              </p>
            )}
            {!listLoading && users.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {users.map((user) => (
                  <AuthorCard
                    key={user.id}
                    user={user}
                    onClick={() => setSelectedUserId(user.id)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/80 text-[10px] font-bold uppercase tracking-wider text-muted">
                <th className="px-6 py-4">User</th>
                <th className="px-4 py-4">Verification</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Last activity</th>
              </tr>
            </thead>
            <tbody>
              {listLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td colSpan={4} className="px-6 py-6">
                      <div className="h-4 animate-pulse rounded bg-border" />
                    </td>
                  </tr>
                ))}
              {!listLoading && users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted">
                    {debouncedSearch.trim()
                      ? `No ${role}s match "${debouncedSearch.trim()}".`
                      : `No ${role}s found.`}
                  </td>
                </tr>
              )}
              {!listLoading &&
                users.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => setSelectedUserId(user.id)}
                    className="cursor-pointer border-b border-border transition hover:bg-surface/40"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={user} />
                        <div>
                          <p className="font-semibold text-foreground">{user.name}</p>
                          <p className="text-xs text-muted">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <VerificationBadge status={user.verificationStatus} />
                    </td>
                    <td className="px-4 py-4">
                      <SystemStatusBadge status={user.systemStatus} />
                    </td>
                    <td className="px-4 py-4 text-muted">{user.lastActivity}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        )}

        <div className="flex flex-col gap-3 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">
            Showing {start}–{end} of {pagination.total.toLocaleString()} {role}s
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
              Page {page} of {pagination.totalPages}
            </span>
            <button
              type="button"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {selectedUserId && (
        <UserDetailPanel
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onUpdated={() => refetch()}
        />
      )}
    </OverviewPageShell>
  );
}
