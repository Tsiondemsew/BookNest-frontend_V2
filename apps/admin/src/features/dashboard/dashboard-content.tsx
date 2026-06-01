'use client';

import {
  BookOpen,
  Building2,
  ChevronDown,
  Download,
  PenLine,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AdminTopHeader } from '@/components/admin-top-header';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { useAdminUserRoleCounts } from '@/hooks/useAdminUserRoleCounts';
import { useModerationStats } from '@/hooks/useModerationStats';
import { RecentApprovalsTable } from './recent-approvals-table';

const DATE_RANGES = [
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'Last 90 Days', days: 90 },
];

function KpiCard({
  label,
  value,
  badge,
  badgeClass,
  sublabel,
  icon,
  iconBg,
  footer,
  href,
}: {
  label: string;
  value: string;
  badge?: string;
  badgeClass?: string;
  sublabel?: string;
  icon: React.ReactNode;
  iconBg: string;
  footer?: React.ReactNode;
  href?: string;
}) {
  const inner = (
    <>
      <div className="flex items-start justify-between">
        <div className={`rounded-xl p-2.5 ${iconBg}`}>{icon}</div>
        {badge && (
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badgeClass}`}
          >
            {badge}
          </span>
        )}
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 text-3xl font-bold text-foreground">{value}</p>
      {sublabel && <p className="mt-1 text-xs text-muted">{sublabel}</p>}
      {footer}
      {href && (
        <p className="mt-3 text-xs font-medium text-primary">View list →</p>
      )}
    </>
  );

  const className =
    'block rounded-xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

  if (href) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    );
  }

  return <div className="rounded-xl border border-border bg-card p-5 shadow-sm">{inner}</div>;
}

export function DashboardContent() {
  const [searchInput, setSearchInput] = useState('');
  const [days, setDays] = useState(30);
  const [rangeOpen, setRangeOpen] = useState(false);

  const { data, loading, error, refetch } = useAdminDashboard(days);
  const {
    counts: roleCounts,
    loading: countsLoading,
    error: countsError,
    refetch: refetchCounts,
  } = useAdminUserRoleCounts();
  const {
    stats: bookStats,
    loading: booksLoading,
    error: booksError,
    refetch: refetchBooks,
  } = useModerationStats();
  const rangeLabel = DATE_RANGES.find((r) => r.days === days)?.label ?? 'Last 30 Days';

  const userCounts = roleCounts ?? data?.metrics.userRoleCounts;
  const searchQuery = searchInput.trim().toLowerCase();

  const filteredApprovals = useMemo(() => {
    const rows = data?.recentApprovals ?? [];
    if (!searchQuery) return rows;
    return rows.filter(
      (row) =>
        row.submitter.toLowerCase().includes(searchQuery) ||
        (row.submitterEmail || '').toLowerCase().includes(searchQuery) ||
        row.assetCategory.toLowerCase().includes(searchQuery) ||
        row.submissionId.toLowerCase().includes(searchQuery) ||
        row.id.toLowerCase().includes(searchQuery),
    );
  }, [data?.recentApprovals, searchQuery]);

  const quickLinks = useMemo(() => {
    if (!searchQuery) return [];
    const q = encodeURIComponent(searchInput.trim());
    return [
      { label: 'Search books', href: `/dashboard/books?status=all&search=${q}` },
      { label: 'Search users', href: `/dashboard/users?search=${q}` },
      { label: 'Search invitations', href: `/dashboard/invitations?search=${q}` },
      { label: 'Reports & logs', href: `/dashboard/reports?search=${q}` },
    ].map((link) => ({ ...link, hint: q }));
  }, [searchInput, searchQuery]);

  const handleExport = () => {
    if (!userCounts) return;
    const lines = [
      'Metric,Value',
      `Total Users,${userCounts.users ?? 0}`,
      `Total Authors,${userCounts.authors ?? 0}`,
      `Total Publishers,${userCounts.publishers ?? 0}`,
      `Total Books,${bookStats?.totalBooks ?? 0}`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-overview-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminTopHeader
        searchPlaceholder="Search system resources..."
        searchValue={searchInput}
        onSearchChange={(value) => setSearchInput(value)}
        adminSubtitle="Super Administrator"
      />

      {searchQuery && (
        <div className="border-b border-border bg-surface/50 px-8 py-3">
          <p className="text-sm text-muted">
            Showing {filteredApprovals.length} recent submission
            {filteredApprovals.length === 1 ? '' : 's'} matching &ldquo;{searchInput.trim()}&rdquo;
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {quickLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-primary hover:bg-surface"
              >
                {link.label} →
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="px-8 py-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              System Overview
            </h1>
            <p className="mt-2 text-sm text-muted">
              Real-time performance and financial tracking
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setRangeOpen((o) => !o)}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-muted shadow-sm hover:bg-surface dark:border-border dark:bg-primary dark:text-muted"
              >
                {rangeLabel}
                <ChevronDown size={16} />
              </button>
              {rangeOpen && (
                <div className="absolute right-0 z-10 mt-2 w-44 overflow-hidden rounded-xl border border-border bg-card shadow-lg dark:border-border dark:bg-primary">
                  {DATE_RANGES.map((r) => (
                    <button
                      key={r.days}
                      type="button"
                      onClick={() => {
                        setDays(r.days);
                        setRangeOpen(false);
                      }}
                      className={`block w-full px-4 py-2.5 text-left text-sm hover:bg-surface dark:hover:bg-primary/90 ${
                        days === r.days ? 'font-semibold text-accent' : 'text-muted'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleExport}
              disabled={loading || !data}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-primary/90 disabled:opacity-50"
            >
              <Download size={18} />
              Export Report
            </button>
          </div>
        </div>

        {(error || countsError || booksError) && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
            {error || countsError || booksError}
            <button
              type="button"
              className="ml-2 font-semibold underline"
              onClick={() => {
                refetch();
                refetchCounts();
                refetchBooks();
              }}
            >
              Retry
            </button>
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Total Users"
            value={
              countsLoading || loading
                ? '—'
                : (userCounts?.users ?? 0).toLocaleString()
            }
            sublabel="Registered readers"
            icon={<Users size={20} className="text-sky-600" />}
            iconBg="bg-sky-50 dark:bg-sky-950/30"
            href="/dashboard/overview/readers"
          />
          <KpiCard
            label="Total Authors"
            value={
              countsLoading || loading
                ? '—'
                : (userCounts?.authors ?? 0).toLocaleString()
            }
            sublabel="Author accounts"
            icon={<PenLine size={20} className="text-accent" />}
            iconBg="bg-surface"
            href="/dashboard/overview/authors"
          />
          <KpiCard
            label="Total Publishers"
            value={
              countsLoading || loading
                ? '—'
                : (userCounts?.publishers ?? 0).toLocaleString()
            }
            sublabel="Publisher accounts"
            icon={<Building2 size={20} className="text-primary" />}
            iconBg="bg-surface"
            href="/dashboard/overview/publishers"
          />
          <KpiCard
            label="Total Books"
            value={
              booksLoading ? '—' : (bookStats?.totalBooks ?? 0).toLocaleString()
            }
            sublabel={
              bookStats
                ? `${bookStats.pending} pending · ${bookStats.approved} approved`
                : 'All catalog submissions'
            }
            icon={<BookOpen size={20} className="text-amber-700 dark:text-amber-400" />}
            iconBg="bg-amber-50 dark:bg-amber-950/30"
            href="/dashboard/overview/books"
          />
        </div>

        <div className="mt-8">
          <RecentApprovalsTable rows={filteredApprovals} loading={loading} />
        </div>

        <footer className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between dark:border-border">
          <p>© {new Date().getFullYear()} LibrarianPro Systems. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-muted">Compliance Center</span>
            <span className="cursor-pointer hover:text-muted">Privacy Policy</span>
            <span className="cursor-pointer hover:text-muted">API Docs</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
