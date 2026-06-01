'use client';

import { ChevronDown, Download, RefreshCw } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminTopHeader } from '@/components/admin-top-header';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { SaleFormatToggle } from '@/components/sale-format-toggle';
import { useAdminReports } from '@/hooks/useAdminReports';
import { matchesSaleFormat, parseSaleFormatParam, type SaleFormatFilter } from '@/lib/sale-format';
import {
  formatPeriodLabel,
  isValidDateRange,
  parsePeriodFromSearchParams,
  periodFromCustomRange,
  periodFromPreset,
  toReportsQuery,
  todayDateInput,
  type AppliedReportPeriod,
  type ReportDaysPreset,
} from '@/lib/report-period';
import { ErrorLogsSection } from './error-logs-section';
import { OperationalReportsSection } from './operational-reports-section';
import { RevenueReportsSection } from './revenue-reports-section';
import { UserGrowthSection } from './user-growth-section';
import type { ReportTransaction } from './types';

const DATE_PRESETS: { label: string; days: ReportDaysPreset }[] = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
];

function ReportSectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="border-b border-border pb-3">
      <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
    </div>
  );
}

const CATEGORIES = [
  { id: 'all', label: 'All Reports' },
  { id: 'revenue', label: 'Revenue' },
  { id: 'operational', label: 'Operational' },
  { id: 'user-growth', label: 'User Growth' },
  { id: 'error-logs', label: 'Error Logs' },
] as const;

export function ReportsCenter() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(() => searchParams.get('search') ?? '');
  const debouncedSearch = useDebouncedValue(searchInput, 400);
  const [saleFormat, setSaleFormat] = useState<SaleFormatFilter>('all');
  const [appliedPeriod, setAppliedPeriod] = useState<AppliedReportPeriod>(() =>
    periodFromPreset(30),
  );
  const [selectedPreset, setSelectedPreset] = useState<ReportDaysPreset | 'custom'>(30);
  const [startDate, setStartDate] = useState(() => periodFromPreset(30).from);
  const [endDate, setEndDate] = useState(() => todayDateInput());
  const [dateError, setDateError] = useState<string | null>(null);
  const [appliedFormat, setAppliedFormat] = useState<SaleFormatFilter>('all');
  const [rangeOpen, setRangeOpen] = useState(false);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]['id']>('all');
  const [growthFetchKey, setGrowthFetchKey] = useState(0);
  const [errorLogsExport, setErrorLogsExport] = useState<(() => Promise<void>) | null>(null);

  useEffect(() => {
    const c = searchParams.get('category');
    if (c === 'revenue' || c === 'operational' || c === 'user-growth' || c === 'error-logs' || c === 'all') {
      setCategory(c);
      if (c === 'user-growth') {
        setGrowthFetchKey((k) => k + 1);
      }
    }
    const formatFromUrl = parseSaleFormatParam(searchParams.get('format'));
    setSaleFormat(formatFromUrl);
    setAppliedFormat(formatFromUrl);

    const period = parsePeriodFromSearchParams(searchParams);
    setAppliedPeriod(period);
    setStartDate(period.from);
    setEndDate(period.to);
    setSelectedPreset(period.preset);
  }, [searchParams]);

  const applyFormatFilter = useCallback(
    (format: SaleFormatFilter) => {
      setSaleFormat(format);
      setAppliedFormat(format);
      const p = new URLSearchParams(searchParams.toString());
      if (format === 'all') p.delete('format');
      else p.set('format', format);
      router.replace(`/dashboard/reports?${p.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const setCategoryAndUrl = (id: (typeof CATEGORIES)[number]['id']) => {
    setCategory(id);
    if (id === 'user-growth' || id === 'all') {
      setGrowthFetchKey((k) => k + 1);
    }
    const p = new URLSearchParams(searchParams.toString());
    if (id === 'all') p.delete('category');
    else p.set('category', id);
    router.replace(`/dashboard/reports?${p.toString()}`, { scroll: false });
  };

  const reportsQuery = useMemo(
    () => toReportsQuery(appliedPeriod, appliedFormat),
    [appliedPeriod, appliedFormat],
  );

  const { data, loading, error, refetch } = useAdminReports(reportsQuery);
  const allReportsView = category === 'all';
  const showRevenuePanel = category === 'revenue' || allReportsView;
  const showFormatFilter = showRevenuePanel;
  const revenueOnly = category === 'revenue';
  const operationalOnly = category === 'operational';
  const errorLogsOnly = category === 'error-logs';
  const userGrowthOnly = category === 'user-growth';
  const rangeLabel = formatPeriodLabel(appliedPeriod);

  const selectPreset = (presetDays: ReportDaysPreset) => {
    const period = periodFromPreset(presetDays);
    setSelectedPreset(presetDays);
    setStartDate(period.from);
    setEndDate(period.to);
    setDateError(null);
  };

  const handleApplyFilters = () => {
    if (!isValidDateRange(startDate, endDate)) {
      setDateError('End date must be on or after the start date.');
      return;
    }
    setDateError(null);
    const period = periodFromCustomRange(startDate, endDate);
    setAppliedPeriod(period);
    setAppliedFormat(saleFormat);
    setSaleFormat(saleFormat);
    setRangeOpen(false);
    setSelectedPreset('custom');

    const p = new URLSearchParams(searchParams.toString());
    p.set('preset', 'custom');
    p.set('from', period.from);
    p.set('to', period.to);
    p.set('days', String(period.days));
    router.replace(`/dashboard/reports?${p.toString()}`, { scroll: false });

    if (category === 'user-growth' || allReportsView) {
      setGrowthFetchKey((k) => k + 1);
    }
  };

  const filteredTransactions = useMemo(() => {
    const rows = data?.financial.transactions ?? [];
    const q = searchInput.trim().toLowerCase();
    let filtered = rows;

    if (category === 'revenue') {
      filtered = filtered.filter(
        (t) => t.category === 'revenue' && (t.status === 'cleared' || !t.status),
      );
    } else if (category === 'operational') {
      filtered = filtered.filter((t) => t.category === 'operational' || t.status === 'refunded');
    }

    if (appliedFormat !== 'all') {
      filtered = filtered.filter((t) => matchesSaleFormat(t.format, appliedFormat));
    }

    if (q) {
      filtered = filtered.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.source.toLowerCase().includes(q) ||
          t.date.toLowerCase().includes(q) ||
          (t.format || '').toLowerCase().includes(q) ||
          (t.customer || '').toLowerCase().includes(q),
      );
    }

    return filtered;
  }, [data, category, searchInput, appliedFormat]);

  const operationalTransactions = useMemo(() => {
    const rows = data?.financial.transactions ?? [];
    const q = searchInput.trim().toLowerCase();
    let filtered = rows.filter(
      (t) => t.category === 'operational' || t.status === 'refunded' || t.status === 'pending',
    );
    if (q) {
      filtered = filtered.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.source.toLowerCase().includes(q) ||
          t.date.toLowerCase().includes(q),
      );
    }
    return filtered;
  }, [data, searchInput]);

  const registerErrorLogsExport = useCallback((handler: (() => Promise<void>) | null) => {
    setErrorLogsExport(() => handler);
  }, []);

  const handleExport = async () => {
    if (errorLogsOnly && errorLogsExport) {
      await errorLogsExport();
      return;
    }

    if (operationalOnly && data?.operational) {
      const op = data.operational;
      const lines = [
        'Metric,Value',
        `Active users (24h),${op.metrics.activeUsers24h}`,
        `Pending moderation,${op.metrics.pendingModeration}`,
        `Unresolved errors,${op.errorLogs.unresolved}`,
        `Suspended accounts,${op.metrics.suspendedAccounts}`,
        `Failed payments,${op.metrics.failedPayments}`,
        `Pending payments,${op.metrics.pendingPayments}`,
        `Error logs total,${op.errorLogs.total}`,
        `Errors (level),${op.errorLogs.byLevel.error}`,
        `Warnings (level),${op.errorLogs.byLevel.warn}`,
      ];
      const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `operational-report-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

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
    <div className="min-h-screen bg-background">
      <AdminTopHeader
        searchPlaceholder="Search reports, logs, or transactions..."
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        adminSubtitle="System Manager"
      />

      <div className="px-8 py-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Reports Center
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              {allReportsView
                ? 'Full system overview — revenue, operations, user growth, error logs, and completed sales in one place.'
                : 'Audit system performance and book sales revenue from completed purchases.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleExport()}
            disabled={
              errorLogsOnly
                ? !errorLogsExport
                : operationalOnly
                  ? loading || !data?.operational
                  : loading || !filteredTransactions.length
            }
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-primary/90 disabled:opacity-50"
          >
            <Download size={18} />
            {errorLogsOnly
              ? 'Export Error Logs'
              : operationalOnly
                ? 'Export Operational'
                : 'Export Data'}
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm dark:border-border dark:bg-primary">
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted">Filter by Category</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryAndUrl(cat.id)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                      category === cat.id
                        ? 'bg-primary text-white shadow-md'
                        : 'border border-border bg-surface text-muted hover:bg-surface dark:border-border dark:bg-surface dark:text-muted'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t border-border pt-5 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between dark:border-border">
              <div className="flex flex-wrap items-end gap-4">
                {showFormatFilter && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted">Format</p>
                    <SaleFormatToggle
                      className="mt-2"
                      value={appliedFormat}
                      disabled={loading}
                      onChange={applyFormatFilter}
                    />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted">Report Period</p>
                  <div className="relative mt-2">
                    <button
                      type="button"
                      onClick={() => setRangeOpen((o) => !o)}
                      className="inline-flex min-w-[180px] max-w-full items-center justify-between gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground"
                    >
                      <span className="truncate">{rangeLabel}</span>
                      <ChevronDown size={16} className="shrink-0 text-muted" />
                    </button>
                    {rangeOpen && (
                      <div className="absolute left-0 z-20 mt-2 w-72 overflow-hidden rounded-xl border border-border bg-card p-3 shadow-lg dark:border-border dark:bg-primary">
                        <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                          Quick range
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {DATE_PRESETS.map((r) => (
                            <button
                              key={r.days}
                              type="button"
                              onClick={() => selectPreset(r.days)}
                              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                selectedPreset === r.days
                                  ? 'bg-primary text-white'
                                  : 'border border-border bg-surface text-muted hover:bg-card'
                              }`}
                            >
                              {r.label}
                            </button>
                          ))}
                        </div>
                        <p className="mt-4 px-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                          Specific dates
                        </p>
                        <div className="mt-2 grid gap-3 sm:grid-cols-2">
                          <label className="block text-xs font-medium text-muted">
                            Start date
                            <input
                              type="date"
                              value={startDate}
                              max={endDate}
                              onChange={(e) => {
                                setStartDate(e.target.value);
                                setSelectedPreset('custom');
                                setDateError(null);
                              }}
                              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
                            />
                          </label>
                          <label className="block text-xs font-medium text-muted">
                            End date
                            <input
                              type="date"
                              value={endDate}
                              min={startDate}
                              max={todayDateInput()}
                              onChange={(e) => {
                                setEndDate(e.target.value);
                                setSelectedPreset('custom');
                                setDateError(null);
                              }}
                              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground"
                            />
                          </label>
                        </div>
                        {dateError && (
                          <p className="mt-2 text-xs font-medium text-red-600">{dateError}</p>
                        )}
                        <button
                          type="button"
                          onClick={() => setRangeOpen(false)}
                          className="mt-3 w-full rounded-lg bg-primary/10 py-2 text-xs font-semibold text-primary hover:bg-primary/15"
                        >
                          Done
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              <div className="flex flex-col items-stretch gap-1 sm:items-end">
                {dateError && (
                  <p className="text-xs font-medium text-red-600">{dateError}</p>
                )}
                <button
                  type="button"
                  onClick={handleApplyFilters}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-primary/90 disabled:opacity-50"
                >
                  <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                  Apply Filters
                </button>
              </div>
            </div>
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

        {showRevenuePanel && (
          <section className={allReportsView ? 'mt-8 space-y-4' : 'mt-8'}>
            {allReportsView && (
              <ReportSectionTitle
                title="Revenue Reports"
                subtitle={`Sales, commission, and trends for ${rangeLabel.toLowerCase()}`}
              />
            )}
            <RevenueReportsSection
              data={data}
              loading={loading}
              transactions={filteredTransactions}
              formatFilter={appliedFormat}
              onFormatSelect={applyFormatFilter}
            />
          </section>
        )}

        {allReportsView && (
          <div className="mt-10 space-y-10">
            <section className="space-y-4">
              <ReportSectionTitle
                title="Operational Reports"
                subtitle={`Platform health, moderation, and payments for ${rangeLabel.toLowerCase()}`}
              />
              <OperationalReportsSection
                data={data}
                loading={loading}
                days={appliedPeriod.days}
                transactions={operationalTransactions}
                embedded
              />
            </section>
            <section className="space-y-4">
              <ReportSectionTitle
                title="User Growth"
                subtitle="Signups and active users by role"
              />
              <UserGrowthSection period={appliedPeriod} fetchKey={growthFetchKey} embedded />
            </section>
            <section className="space-y-4">
              <ReportSectionTitle
                title="Error Logs"
                subtitle="System errors and warnings"
              />
              <ErrorLogsSection period={appliedPeriod} search={debouncedSearch} embedded />
            </section>
          </div>
        )}

        {errorLogsOnly && (
          <ErrorLogsSection
            period={appliedPeriod}
            search={debouncedSearch}
            onRegisterExport={registerErrorLogsExport}
          />
        )}

        {userGrowthOnly && (
          <UserGrowthSection period={appliedPeriod} fetchKey={growthFetchKey} />
        )}

        {operationalOnly && (
          <OperationalReportsSection
            data={data}
            loading={loading}
            days={appliedPeriod.days}
            transactions={operationalTransactions}
          />
        )}

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
