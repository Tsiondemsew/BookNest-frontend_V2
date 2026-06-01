'use client';

import { useMemo, useState } from 'react';
import { RefreshCw, TrendingDown, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import { useAdminUserGrowth } from '@/hooks/useAdminUserGrowth';
import type { AppliedReportPeriod } from '@/lib/report-period';
import { UserGrowthChart } from './user-growth-chart';
import type { GrowthComparisonMetric, UserGrowthRoleFilter } from './types';

const ROLE_CARDS: {
  id: UserGrowthRoleFilter;
  label: string;
  statKey: 'totalUsers' | 'readers' | 'authors' | 'publishers';
  newKey?: keyof { reader: number; author: number; publisher: number };
  href: string;
  activeRing: string;
}[] = [
  {
    id: 'all',
    label: 'All users',
    statKey: 'totalUsers',
    href: '/dashboard/users',
    activeRing: 'ring-primary',
  },
  {
    id: 'reader',
    label: 'Readers',
    statKey: 'readers',
    newKey: 'reader',
    href: '/dashboard/users?role=reader',
    activeRing: 'ring-primary',
  },
  {
    id: 'author',
    label: 'Authors',
    statKey: 'authors',
    newKey: 'author',
    href: '/dashboard/users?role=author',
    activeRing: 'ring-violet-500',
  },
  {
    id: 'publisher',
    label: 'Publishers',
    statKey: 'publishers',
    newKey: 'publisher',
    href: '/dashboard/users?role=publisher',
    activeRing: 'ring-sky-500',
  },
];

function ComparisonCard({
  metric,
  loading,
}: {
  metric?: GrowthComparisonMetric;
  loading: boolean;
}) {
  if (!metric && !loading) return null;
  const up = (metric?.change ?? 0) >= 0;

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
        {loading ? '—' : metric?.label}
      </p>
      <div className="mt-2 flex items-end justify-between gap-2">
        <div>
          <p className="text-2xl font-bold text-foreground">
            {loading ? '—' : metric?.current.toLocaleString()}
          </p>
          <p className="text-xs text-muted">
            vs {loading ? '—' : metric?.previous.toLocaleString()} prior
          </p>
        </div>
        {!loading && metric && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${
              up
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {metric.changeLabel}
          </span>
        )}
      </div>
    </div>
  );
}

type Props = {
  period: AppliedReportPeriod;
  fetchKey?: number;
  embedded?: boolean;
};

export function UserGrowthSection({ period, fetchKey = 0, embedded = false }: Props) {
  const { data: growth, loading, error, refetch } = useAdminUserGrowth(period, true, fetchKey);
  const days = period.days;
  const [roleFilter, setRoleFilter] = useState<UserGrowthRoleFilter>('all');
  const [chartView, setChartView] = useState<'daily' | 'monthly'>('daily');

  const summary = growth?.summary;
  const periodDays = growth?.days ?? days;

  const chartData = useMemo(() => {
    if (!growth) return [];
    if (chartView === 'monthly') {
      return growth.monthlyTrendByRole?.[roleFilter] ?? [];
    }
    return growth.signupsTrendByRole?.[roleFilter] ?? growth.signupsTrend ?? [];
  }, [growth, roleFilter, chartView]);

  const trendTotal = chartData.reduce((s, p) => s + p.signups, 0);
  const roleLabel =
    roleFilter === 'all'
      ? 'All users'
      : roleFilter === 'reader'
        ? 'Readers'
        : roleFilter === 'author'
          ? 'Authors'
          : 'Publishers';

  const maxRole = Math.max(
    growth?.roleCounts.readers ?? 0,
    growth?.roleCounts.authors ?? 0,
    growth?.roleCounts.publishers ?? 0,
    1,
  );

  const handleRefresh = () => {
    void refetch();
  };

  return (
    <div className={embedded ? 'space-y-6' : 'mt-8 space-y-6'}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Click a role card to filter the chart. Compare growth day-to-day and month-to-month below.
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:bg-surface disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <Link
            href="/dashboard/users"
            className="text-xs font-semibold text-primary hover:underline"
          >
            Manage users →
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button type="button" className="ml-2 font-semibold underline" onClick={handleRefresh}>
            Retry
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ROLE_CARDS.map((card) => {
          const isActive = roleFilter === card.id;
          const total =
            card.statKey === 'totalUsers'
              ? summary?.totalUsers ?? 0
              : summary?.[card.statKey] ?? 0;
          const newInPeriod =
            card.newKey && growth?.newByRole
              ? growth.newByRole[card.newKey]
              : summary?.newSignupsInPeriod ?? 0;

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => setRoleFilter(card.id)}
              className={`rounded-xl border border-border bg-card p-4 text-left shadow-sm transition hover:border-primary/40 hover:shadow-md ${
                isActive ? `ring-2 ${card.activeRing}` : ''
              }`}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                {card.label}
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {loading ? '—' : total.toLocaleString()}
              </p>
              <p className="mt-1 text-[10px] font-semibold text-muted">
                +{loading ? '—' : newInPeriod} new in {periodDays}d
              </p>
              <Link
                href={card.href}
                onClick={(e) => e.stopPropagation()}
                className="mt-2 inline-block text-[10px] font-semibold text-primary hover:underline"
              >
                View list →
              </Link>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ComparisonCard metric={growth?.comparisons?.dayOverDay} loading={loading} />
        <ComparisonCard metric={growth?.comparisons?.weekOverWeek} loading={loading} />
        <ComparisonCard metric={growth?.comparisons?.monthOverMonth} loading={loading} />
        <ComparisonCard metric={growth?.comparisons?.periodHalf} loading={loading} />
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm xl:col-span-3">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-primary" />
              <h2 className="text-lg font-bold text-foreground">
                {roleLabel} — {chartView === 'daily' ? 'Daily' : 'Monthly'} signups
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex rounded-lg border border-border p-0.5">
                {(['daily', 'monthly'] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setChartView(v)}
                    className={`rounded-md px-3 py-1 text-xs font-semibold capitalize ${
                      chartView === v
                        ? 'bg-primary text-white'
                        : 'text-muted hover:text-foreground'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
              {!loading && (
                <span className="text-xs font-semibold text-muted">
                  {trendTotal.toLocaleString()} in view
                </span>
              )}
            </div>
          </div>
          <p className="mb-4 text-xs text-muted">
            {chartView === 'daily'
              ? `Day-by-day new registrations (last ${periodDays} days) for ${roleLabel.toLowerCase()}.`
              : `Month-by-month new registrations (last 12 months) for ${roleLabel.toLowerCase()}.`}
          </p>
          <UserGrowthChart data={chartData} loading={loading} view={chartView} />
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm xl:col-span-2">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-accent" />
            <h2 className="text-base font-bold text-foreground">Users by role</h2>
          </div>
          <p className="mt-1 text-xs text-muted">Platform totals (click cards above to filter chart)</p>

          <div className="mt-6 space-y-5">
            {(
              [
                { label: 'Readers', value: growth?.roleCounts.readers ?? 0, color: 'from-primary to-accent' },
                { label: 'Authors', value: growth?.roleCounts.authors ?? 0, color: 'from-violet-600 to-violet-400' },
                { label: 'Publishers', value: growth?.roleCounts.publishers ?? 0, color: 'from-sky-600 to-sky-400' },
              ] as const
            ).map((row) => {
              const pct = maxRole > 0 ? Math.round((row.value / maxRole) * 100) : 0;
              return (
                <div key={row.label}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-muted">{row.label}</span>
                    <span className="font-semibold">{loading ? '—' : row.value.toLocaleString()}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-surface">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${row.color}`}
                      style={{ width: `${Math.max(pct, row.value > 0 ? 8 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-surface/80 p-3">
              <p className="text-[10px] font-bold uppercase text-muted">New signups</p>
              <p className="mt-1 text-xl font-bold text-emerald-600">
                {loading ? '—' : summary?.newSignupsInPeriod ?? 0}
              </p>
              <p className="text-[10px] text-muted">Last {periodDays} days (all roles)</p>
            </div>
            <div className="rounded-xl border border-border bg-surface/80 p-3">
              <p className="text-[10px] font-bold uppercase text-muted">Active (24h)</p>
              <p className="mt-1 text-xl font-bold text-foreground">
                {loading ? '—' : summary?.activeUsers24h ?? 0}
              </p>
            </div>
          </div>

          {!loading && (summary?.suspendedOrDisabled ?? 0) > 0 && (
            <p className="mt-4 text-xs text-amber-700 dark:text-amber-300">
              {summary?.suspendedOrDisabled} account
              {(summary?.suspendedOrDisabled ?? 0) === 1 ? ' is' : 's are'} suspended or disabled.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
