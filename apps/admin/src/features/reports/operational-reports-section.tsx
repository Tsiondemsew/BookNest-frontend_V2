'use client';

import {
  Activity,
  AlertTriangle,
  BookOpen,
  Clock,
  RefreshCw,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { UsabilityIndexChart } from '@/features/dashboard/usability-index-chart';
import type { OperationalReportData, ReportTransaction, ReportsCenterData } from './types';

function MetricCard({
  label,
  value,
  sublabel,
  href,
  badge,
  badgeClass,
  active,
  onSelect,
}: {
  label: string;
  value: string;
  sublabel?: string;
  href?: string;
  badge?: string;
  badgeClass?: string;
  active?: boolean;
  onSelect?: () => void;
}) {
  const content = (
    <>
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
      {sublabel && <p className="mt-1 text-[10px] font-semibold text-muted">{sublabel}</p>}
      {badge && (
        <span
          className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeClass}`}
        >
          {badge}
        </span>
      )}
      {href && (
        <span className="mt-2 inline-block text-[10px] font-semibold text-primary">View →</span>
      )}
    </>
  );

  const className = `rounded-xl border border-border bg-card p-4 text-left shadow-sm transition hover:border-primary/40 hover:shadow-md ${
    active ? 'ring-2 ring-primary' : ''
  }`;

  if (onSelect) {
    return (
      <button type="button" onClick={onSelect} className={className}>
        {content}
      </button>
    );
  }

  if (href) {
    return (
      <Link href={href} className={`block ${className}`}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}

function ComparisonBadge({ change, changeLabel }: { change: number; changeLabel: string }) {
  const up = change >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${
        up ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
      }`}
    >
      {up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
      {changeLabel}
    </span>
  );
}

type Props = {
  data: ReportsCenterData | null;
  loading: boolean;
  days: number;
  transactions?: ReportTransaction[];
  embedded?: boolean;
};

export function OperationalReportsSection({
  data,
  loading,
  days,
  transactions = [],
  embedded = false,
}: Props) {
  const op: OperationalReportData | undefined = data?.operational;
  const activityTrend = op?.activityTrend ?? data?.usabilityIndex ?? [];

  const issueRows = useMemo(
    () =>
      transactions.filter(
        (t) => t.category === 'operational' || t.status === 'refunded' || t.status === 'pending',
      ),
    [transactions],
  );

  const modMax = Math.max(
    op?.moderation.pending ?? 0,
    op?.moderation.approved ?? 0,
    op?.moderation.rejected ?? 0,
    op?.moderation.changesRequested ?? 0,
    1,
  );

  return (
    <div className={embedded ? 'space-y-6' : 'mt-8 space-y-6'}>
      {!embedded && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">
            Platform health, moderation queue, error logs, and payment issues for the last {days}{' '}
            days.
          </p>
          <Link
            href="/dashboard/reports?category=error-logs"
            className="text-xs font-semibold text-primary hover:underline"
          >
            Full error logs →
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Active users (24h)"
          value={loading ? '—' : String(op?.metrics.activeUsers24h ?? 0)}
          sublabel={
            loading ? undefined : `Change ${op?.systemHealth.activeSessionsChangeLabel ?? '0%'}`
          }
          href="/dashboard/users"
        />
        <MetricCard
          label="Pending moderation"
          value={loading ? '—' : String(op?.metrics.pendingModeration ?? 0)}
          sublabel="Books awaiting review"
          href="/dashboard/books?status=pending_review"
          badge={
            !loading && (op?.metrics.pendingModeration ?? 0) > 0 ? 'Action required' : undefined
          }
          badgeClass="bg-amber-100 text-amber-900"
        />
        <MetricCard
          label="Unresolved errors"
          value={loading ? '—' : String(op?.errorLogs.unresolved ?? 0)}
          sublabel={
            loading
              ? undefined
              : `${op?.errorLogs.last24h ?? 0} in last 24h · ${op?.errorLogs.errorRate ?? '0%'} error share`
          }
          href="/dashboard/reports?category=error-logs"
          badge={op?.errorLogs.errorRateStatus}
          badgeClass={
            op?.errorLogs.errorRateStatus === 'ELEVATED'
              ? 'bg-red-100 text-red-800'
              : 'bg-emerald-100 text-emerald-800'
          }
        />
        <MetricCard
          label="Suspended / disabled"
          value={loading ? '—' : String(op?.metrics.suspendedAccounts ?? 0)}
          sublabel="Accounts restricted"
          href="/dashboard/users"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Failed payments"
          value={loading ? '—' : String(op?.metrics.failedPayments ?? 0)}
          sublabel={`In last ${days} days`}
        />
        <MetricCard
          label="Pending payments"
          value={loading ? '—' : String(op?.metrics.pendingPayments ?? 0)}
          sublabel={`In last ${days} days`}
        />
        <MetricCard
          label="Avg response (est.)"
          value={loading ? '—' : `${op?.systemHealth.avgResponseTimeMs ?? 0}ms`}
          sublabel={loading ? undefined : `Peak load ${op?.systemHealth.peakBackendLoad ?? 0}`}
        />
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
            {loading ? '—' : op?.activityComparison.label}
          </p>
          <div className="mt-2 flex items-end justify-between gap-2">
            <div>
              <p className="text-2xl font-bold text-foreground">
                {loading ? '—' : op?.activityComparison.current.toLocaleString()}
              </p>
              <p className="text-xs text-muted">
                vs {loading ? '—' : op?.activityComparison.previous.toLocaleString()} prior
              </p>
            </div>
            {!loading && op && (
              <ComparisonBadge
                change={op.activityComparison.change}
                changeLabel={op.activityComparison.changeLabel}
              />
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm xl:col-span-3">
          <div className="mb-4 flex items-center gap-2">
            <Activity size={18} className="text-primary" />
            <h2 className="text-lg font-bold text-foreground">System activity trend</h2>
          </div>
          <p className="mb-4 text-xs text-muted">
            Derived from user updates and book submissions over the report period.
          </p>
          <UsabilityIndexChart data={activityTrend} loading={loading} />
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm xl:col-span-2">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-accent" />
            <h2 className="text-base font-bold text-foreground">Moderation queue</h2>
          </div>
          <p className="mt-1 text-xs text-muted">Books by approval status</p>

          <div className="mt-6 space-y-4">
            {(
              [
                { label: 'Pending review', value: op?.moderation.pending ?? 0, color: 'from-amber-500 to-amber-300', href: '/dashboard/books?status=pending_review' },
                { label: 'Approved', value: op?.moderation.approved ?? 0, color: 'from-emerald-600 to-emerald-400', href: '/dashboard/books?status=approved' },
                { label: 'Changes requested', value: op?.moderation.changesRequested ?? 0, color: 'from-sky-600 to-sky-400', href: '/dashboard/books?status=changes_requested' },
                { label: 'Rejected', value: op?.moderation.rejected ?? 0, color: 'from-red-600 to-red-400', href: '/dashboard/books?status=rejected' },
              ] as const
            ).map((row) => {
              const pct = Math.round((row.value / modMax) * 100);
              return (
                <Link key={row.label} href={row.href} className="block group">
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium text-muted group-hover:text-foreground">
                      {row.label}
                    </span>
                    <span className="font-semibold">{loading ? '—' : row.value.toLocaleString()}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${row.color}`}
                      style={{ width: `${Math.max(pct, row.value > 0 ? 8 : 0)}%` }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-surface/80 p-3">
              <p className="text-[10px] font-bold uppercase text-muted">Catalog formats</p>
              <p className="mt-1 text-xl font-bold text-foreground">
                {loading ? '—' : op?.metrics.catalogFormats ?? 0}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface/80 p-3">
              <p className="text-[10px] font-bold uppercase text-muted">Total users</p>
              <p className="mt-1 text-xl font-bold text-foreground">
                {loading ? '—' : op?.metrics.totalUsers ?? 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {data?.usability && (
          <>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-muted">
                <Users size={16} />
                <span className="text-xs font-bold uppercase">{data.usability.searchIntent.label}</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {loading ? '—' : data.usability.searchIntent.value}
              </p>
              <p className="text-[10px] text-muted">{data.usability.searchIntent.unit}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-muted">
                <BookOpen size={16} />
                <span className="text-xs font-bold uppercase">{data.usability.assetDownloads.label}</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {loading ? '—' : data.usability.assetDownloads.value}
              </p>
              <p className="text-[10px] text-muted">{data.usability.assetDownloads.unit}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-muted">
                <Clock size={16} />
                <span className="text-xs font-bold uppercase">Avg load (est.)</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {loading ? '—' : data.usability.avgLoadTime.value}
              </p>
              <p className="text-[10px] font-semibold text-emerald-700">{data.usability.avgLoadTime.status}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-muted">
                <AlertTriangle size={16} />
                <span className="text-xs font-bold uppercase">Error rate</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {loading ? '—' : data.usability.errorRate.value}
              </p>
              <p className="text-[10px] font-semibold text-muted">{data.usability.errorRate.status}</p>
            </div>
          </>
        )}
      </div>

      {op && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldAlert size={18} className="text-red-600" />
              <h2 className="text-base font-bold text-foreground">Error log summary</h2>
            </div>
            <Link
              href="/dashboard/reports?category=error-logs"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Open error logs
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {(
              [
                { label: 'Total', value: op.errorLogs.total },
                { label: 'Unresolved', value: op.errorLogs.unresolved },
                { label: 'Resolved', value: op.errorLogs.resolved },
                { label: 'Errors', value: op.errorLogs.byLevel.error },
                { label: 'Warnings', value: op.errorLogs.byLevel.warn },
                { label: 'Info', value: op.errorLogs.byLevel.info },
              ] as const
            ).map((item) => (
              <div key={item.label} className="rounded-lg border border-border bg-surface/50 px-3 py-2">
                <p className="text-[10px] font-bold uppercase text-muted">{item.label}</p>
                <p className="text-lg font-bold text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <RefreshCw size={18} className="text-muted" />
            <h2 className="text-base font-bold text-foreground">Operational issues</h2>
          </div>
          <p className="text-xs text-muted">Refunds, pending, and non-revenue events</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/80 text-[10px] font-bold uppercase tracking-wider text-muted">
                <th className="px-6 py-3">ID</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td colSpan={5} className="px-6 py-4">
                      <div className="h-4 animate-pulse rounded bg-border" />
                    </td>
                  </tr>
                ))}
              {!loading && issueRows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-muted">
                    No operational payment or catalog issues in this period.
                  </td>
                </tr>
              )}
              {!loading &&
                issueRows.map((tx) => (
                  <tr key={tx.id} className="border-b border-border hover:bg-surface/50">
                    <td className="px-6 py-3 font-mono text-xs font-semibold">{tx.id}</td>
                    <td className="max-w-[220px] truncate px-4 py-3">{tx.source}</td>
                    <td className="px-4 py-3 font-semibold">{tx.amountFormatted}</td>
                    <td className="px-4 py-3 text-muted">{tx.date}</td>
                    <td className="px-4 py-3 capitalize text-muted">{tx.status}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
