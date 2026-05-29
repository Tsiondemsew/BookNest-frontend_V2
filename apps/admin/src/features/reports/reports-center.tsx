'use client';

import {
  Activity,
  BarChart3,
  ChevronDown,
  Download,
  FileText,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { AdminTopHeader } from '@/components/admin-top-header';
import { useAdminReports } from '@/hooks/useAdminReports';
import { RevenueTrendChart } from './revenue-trend-chart';
import type { ReportTransaction, TxStatus } from './types';

const DATE_RANGES = [
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'Last 90 Days', days: 90 },
];

const CATEGORIES = [
  { id: 'all', label: 'All Reports' },
  { id: 'revenue', label: 'Revenue' },
  { id: 'operational', label: 'Operational' },
  { id: 'user-growth', label: 'User Growth' },
  { id: 'error-logs', label: 'Error Logs' },
] as const;

function MetricCard({
  label,
  value,
  changeLabel,
  change,
  loading,
}: {
  label: string;
  value: string;
  changeLabel: string;
  change: number;
  loading: boolean;
}) {
  const positive = change >= 0;
  const isLatency = label === 'System Latency';
  const good = isLatency ? change < 0 : positive;

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
        {loading ? '—' : value}
      </p>
      <div
        className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold ${
          good ? 'text-emerald-600' : change === 0 ? 'text-zinc-500' : 'text-red-600'
        }`}
      >
        {change > 0 ? <TrendingUp size={14} /> : change < 0 ? <TrendingDown size={14} /> : null}
        {loading ? '—' : changeLabel}
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: TxStatus }) {
  const colors: Record<TxStatus, string> = {
    cleared: 'bg-emerald-500',
    pending: 'bg-amber-400',
    refunded: 'bg-zinc-400',
  };
  const labels: Record<TxStatus, string> = {
    cleared: 'Cleared',
    pending: 'Pending',
    refunded: 'Refunded',
  };
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
      <span className={`h-2 w-2 rounded-full ${colors[status]}`} />
      {labels[status]}
    </span>
  );
}

function EngagementBar({ label, value, max, unit }: { label: string; value: number; max: number; unit: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
        <span className="text-zinc-500">
          {value.toLocaleString()} {unit}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all"
          style={{ width: `${Math.max(pct, 8)}%` }}
        />
      </div>
    </div>
  );
}

export function ReportsCenter() {
  const [searchInput, setSearchInput] = useState('');
  const [days, setDays] = useState(30);
  const [rangeOpen, setRangeOpen] = useState(false);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]['id']>('all');
  const [reportType, setReportType] = useState('summary');

  const { data, loading, error, refetch } = useAdminReports(days);

  const rangeLabel = DATE_RANGES.find((r) => r.days === days)?.label ?? 'Last 30 Days';

  const filteredTransactions = useMemo(() => {
    const rows = data?.financial.transactions ?? [];
    const q = searchInput.trim().toLowerCase();
    let filtered = rows;

    if (category === 'revenue') {
      filtered = filtered.filter((t) => t.category === 'revenue');
    } else if (category === 'operational') {
      filtered = filtered.filter((t) => t.category === 'operational' || t.status === 'refunded');
    } else if (category === 'user-growth') {
      filtered = filtered.filter((t) => t.source.toLowerCase().includes('subscription'));
    } else if (category === 'error-logs') {
      filtered = filtered.filter((t) => t.status === 'refunded');
    }

    if (q) {
      filtered = filtered.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.source.toLowerCase().includes(q) ||
          t.date.toLowerCase().includes(q),
      );
    }

    return filtered;
  }, [data, category, searchInput]);

  const maxEngagement = Math.max(
    data?.usability.searchIntent.value ?? 0,
    data?.usability.assetDownloads.value ?? 0,
    1,
  );

  const handleExport = () => {
    const rows = filteredTransactions;
    if (!rows.length) return;
    const header = 'Transaction ID,Source,Amount,Date,Status\n';
    const body = rows
      .map((t: ReportTransaction) =>
        [t.id, `"${t.source}"`, t.amountFormatted, t.date, t.status].join(','),
      )
      .join('\n');
    const blob = new Blob([header + body], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reports-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-zinc-950">
      <AdminTopHeader
        searchPlaceholder="Search reports, logs, or transactions..."
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        adminSubtitle="System Manager"
      />

      <div className="px-8 py-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Reports Center
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
              Audit and visualize system-wide performance and fiscal metrics.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setRangeOpen((o) => !o)}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
              >
                {rangeLabel}
                <ChevronDown size={16} />
              </button>
              {rangeOpen && (
                <div className="absolute right-0 z-10 mt-2 w-44 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                  {DATE_RANGES.map((r) => (
                    <button
                      key={r.days}
                      type="button"
                      onClick={() => {
                        setDays(r.days);
                        setRangeOpen(false);
                      }}
                      className={`block w-full px-4 py-2.5 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 ${
                        days === r.days ? 'font-semibold text-indigo-600' : 'text-zinc-700 dark:text-zinc-300'
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
              disabled={loading || !filteredTransactions.length}
              className="inline-flex items-center gap-2 rounded-xl bg-[#4f46e5] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700 disabled:opacity-50"
            >
              <Download size={18} />
              Export Data
            </button>
          </div>
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
          <MetricCard
            label="Total Revenue"
            value={data?.metrics.totalRevenue.formatted ?? String(data?.metrics.totalRevenue.value ?? 0)}
            changeLabel={data?.metrics.totalRevenue.changeLabel ?? '—'}
            change={data?.metrics.totalRevenue.change ?? 0}
            loading={loading}
          />
          <MetricCard
            label="Active Sessions"
            value={(data?.metrics.activeSessions.value ?? 0).toLocaleString()}
            changeLabel={data?.metrics.activeSessions.changeLabel ?? '—'}
            change={data?.metrics.activeSessions.change ?? 0}
            loading={loading}
          />
          <MetricCard
            label="System Latency"
            value={data?.metrics.systemLatency.formatted ?? '42ms'}
            changeLabel={data?.metrics.systemLatency.changeLabel ?? '—'}
            change={data?.metrics.systemLatency.change ?? 0}
            loading={loading}
          />
          <MetricCard
            label="Failed Auth"
            value={String(data?.metrics.failedAuth.value ?? 0)}
            changeLabel={data?.metrics.failedAuth.changeLabel ?? '—'}
            change={data?.metrics.failedAuth.change ?? 0}
            loading={loading}
          />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-5">
          <div className="xl:col-span-3">
            <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-indigo-600" />
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white">Financial Reports</h2>
                </div>
                <div className="flex gap-4 text-xs font-semibold text-indigo-600">
                  <button type="button" className="hover:underline">
                    Detailed Logs
                  </button>
                  <button type="button" className="hover:underline">
                    Tax Audit
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-100 bg-zinc-50/80 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/50">
                      <th className="px-6 py-3">Transaction ID</th>
                      <th className="px-4 py-3">Source</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading &&
                      Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800">
                          <td colSpan={5} className="px-6 py-4">
                            <div className="h-4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                          </td>
                        </tr>
                      ))}

                    {!loading && filteredTransactions.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-zinc-500">
                          No transactions match your filters.
                        </td>
                      </tr>
                    )}

                    {!loading &&
                      filteredTransactions.map((tx) => (
                        <tr
                          key={tx.id}
                          className="border-b border-zinc-100 transition hover:bg-zinc-50/50 dark:border-zinc-800 dark:hover:bg-zinc-800/30"
                        >
                          <td className="px-6 py-3.5 font-mono text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                            #{tx.id}
                          </td>
                          <td className="px-4 py-3.5 text-zinc-700 dark:text-zinc-300">{tx.source}</td>
                          <td
                            className={`px-4 py-3.5 font-semibold ${
                              tx.amount < 0 ? 'text-zinc-500' : 'text-zinc-900 dark:text-white'
                            }`}
                          >
                            {tx.amount < 0 ? `(${tx.amountFormatted.replace('-', '')})` : tx.amountFormatted}
                          </td>
                          <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-400">{tx.date}</td>
                          <td className="px-4 py-3.5">
                            <StatusDot status={tx.status} />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-zinc-100 px-6 py-5 dark:border-zinc-800">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    Revenue Trend ({days}D)
                  </p>
                  <span
                    className={`text-xs font-bold ${
                      (data?.financial.trendChange ?? '').startsWith('-')
                        ? 'text-red-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {loading ? '—' : data?.financial.trendChange}
                  </span>
                </div>
                <RevenueTrendChart data={data?.financial.revenueTrend ?? []} loading={loading} />
                {!loading && data?.financial.trendSummary && (
                  <p className="mt-3 text-xs text-zinc-500">
                    Period total:{' '}
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                      {data.financial.trendSummary}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="xl:col-span-2">
            <div className="h-full rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-violet-600" />
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">Usability Reports</h2>
              </div>

              <div className="mt-6 space-y-5">
                <EngagementBar
                  label={data?.usability.searchIntent.label ?? 'Search Intent'}
                  value={data?.usability.searchIntent.value ?? 0}
                  max={maxEngagement}
                  unit={data?.usability.searchIntent.unit ?? 'ops'}
                />
                <EngagementBar
                  label={data?.usability.assetDownloads.label ?? 'Asset Downloads'}
                  value={data?.usability.assetDownloads.value ?? 0}
                  max={maxEngagement}
                  unit={data?.usability.assetDownloads.unit ?? 'ops'}
                />
              </div>

              <p className="mb-3 mt-8 text-xs font-bold uppercase tracking-wider text-zinc-500">System Health</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-zinc-100 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Avg Load Time</p>
                  <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-white">
                    {loading ? '—' : data?.usability.avgLoadTime.value}
                  </p>
                  <span className="mt-1 inline-block text-[10px] font-bold text-emerald-600">
                    {data?.usability.avgLoadTime.status ?? 'OPTIMAL'}
                  </span>
                </div>
                <div className="rounded-xl border border-zinc-100 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Error Rate</p>
                  <p className="mt-1 text-xl font-bold text-zinc-900 dark:text-white">
                    {loading ? '—' : data?.usability.errorRate.value}
                  </p>
                  <span className="mt-1 inline-block text-[10px] font-bold text-emerald-600">
                    {data?.usability.errorRate.status ?? 'STABLE'}
                  </span>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-center">
                <div className="relative flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br from-slate-800 to-slate-950 shadow-inner">
                  <div className="absolute inset-3 rounded-full border border-indigo-500/30" />
                  <div className="absolute inset-6 rounded-full border border-violet-400/20" />
                  <Activity size={32} className="text-indigo-400/80" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Filter by Category</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                      category === cat.id
                        ? 'bg-[#4f46e5] text-white shadow-md'
                        : 'border border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label htmlFor="report-type" className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Report Type
                </label>
                <select
                  id="report-type"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="mt-2 block w-full min-w-[200px] rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                >
                  <option value="summary">Summary (Aggregate)</option>
                  <option value="detailed">Detailed (Line Items)</option>
                  <option value="audit">Audit Trail</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-100 px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                <RefreshCw size={16} />
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        <footer className="mt-10 flex flex-col gap-2 border-t border-zinc-200 pt-6 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
          <p>© {new Date().getFullYear()} LibrarianPro Systems. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-zinc-700">Compliance Center</span>
            <span className="cursor-pointer hover:text-zinc-700">Privacy Policy</span>
            <span className="cursor-pointer hover:text-zinc-700">API Docs</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
