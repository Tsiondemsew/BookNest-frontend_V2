'use client';

import Link from 'next/link';
import { BookOpen, Clock, Search, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useAdminRecentTasks } from '@/hooks/useAdminRecentTasks';

function formatWhen(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function categoryBadge(category: string) {
  const map: Record<string, string> = {
    books: 'bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300',
    users: 'bg-violet-100 text-violet-800 dark:bg-violet-950/50 dark:text-violet-300',
    invitations: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
    settings: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
    general: 'bg-surface text-muted',
  };
  return map[category] || map.general;
}

type RecentAdminTasksProps = {
  onOpenUser?: (userId: string) => void;
};

export function RecentAdminTasks({ onOpenUser }: RecentAdminTasksProps) {
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(searchInput, 350);

  const { tasks, pagination, loading, error, refetch } = useAdminRecentTasks({
    search: debouncedSearch,
    page,
    limit: 12,
  });

  useEffect(() => {
    if (page > pagination.totalPages && pagination.totalPages > 0) {
      setPage(pagination.totalPages);
    }
  }, [page, pagination.totalPages]);

  const onSearchChange = (value: string) => {
    setSearchInput(value);
    setPage(1);
  };

  return (
    <div className="mt-8 rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-6 py-4">
        <h2 className="text-lg font-bold text-foreground">Recent admin tasks</h2>
        <p className="mt-1 text-sm text-muted">
          Book reviews, user moderation, and other actions performed by admins.
        </p>
        <div className="relative mt-4 max-w-md">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search descriptions, admin, book, action, or email…"
            className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted"
          />
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button type="button" className="ml-2 font-semibold underline" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      )}

      <div className="divide-y divide-border">
        {loading && tasks.length === 0 && (
          <p className="px-6 py-8 text-sm text-muted">Loading tasks…</p>
        )}

        {!loading && tasks.length === 0 && (
          <p className="px-6 py-8 text-sm text-muted">
            {debouncedSearch
              ? 'No tasks match your search.'
              : 'No admin activity recorded yet.'}
          </p>
        )}

        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${categoryBadge(task.category)}`}
                >
                  {task.category}
                </span>
                <span className="text-sm font-semibold text-foreground">{task.label}</span>
              </div>
              {task.description && (
                <p className="mt-2 whitespace-pre-line rounded-lg bg-surface/60 px-3 py-2 text-sm leading-relaxed text-foreground">
                  {task.description}
                </p>
              )}
              <p className="mt-1 text-xs text-muted">
                <span className="font-medium text-foreground">{task.adminName}</span>
                {task.adminEmail && (
                  <span className="text-muted"> · {task.adminEmail}</span>
                )}
              </p>
              <div className="mt-2 flex flex-wrap gap-3 text-xs">
                {task.bookId && task.bookTitle && (
                  <Link
                    href={`/dashboard/books/${task.bookId}?returnTo=/dashboard/users`}
                    className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                  >
                    <BookOpen size={12} />
                    {task.bookTitle}
                  </Link>
                )}
                {task.targetUserId && (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 font-semibold text-accent hover:underline"
                    onClick={() => onOpenUser?.(task.targetUserId!)}
                  >
                    <User size={12} />
                    {task.targetUserEmail || 'View user'}
                  </button>
                )}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 text-xs text-muted">
              <Clock size={14} />
              {formatWhen(task.createdAt)}
            </div>
          </div>
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-6 py-3">
          <p className="text-xs text-muted">
            {pagination.total} task{pagination.total === 1 ? '' : 's'}
            {debouncedSearch ? ' matching search' : ''}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium disabled:opacity-40"
            >
              Previous
            </button>
            <span className="flex items-center px-2 text-xs text-muted">
              {page} / {pagination.totalPages}
            </span>
            <button
              type="button"
              disabled={page >= pagination.totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
