'use client';

import {
  BookOpen,
  ChevronDown,
  DollarSign,
  Download,
  RefreshCw,
  Settings,
  TrendingUp,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminTopHeader } from '@/components/admin-top-header';
import { SaleFormatToggle } from '@/components/sale-format-toggle';
import { parseSaleFormatParam, type SaleFormatFilter } from '@/lib/sale-format';
import { useAdminRevenueDashboard } from '@/hooks/useAdminRevenue';
import { TopSoldBooksButtons } from './revenue-charts';
import { PeriodReportTable } from './period-report-table';
import {
  downloadCsv,
  downloadExcel,
  formatEtb,
  printAsPdf,
  reportToExportRows,
  tableHtmlFromRows,
} from './export-utils';
import type { RevenuePreset } from './types';

const DATE_PRESETS: { id: RevenuePreset; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'this_week', label: 'This Week' },
  { id: 'last_week', label: 'Last Week' },
  { id: 'this_month', label: 'This Month' },
  { id: 'last_month', label: 'Last Month' },
  { id: 'this_year', label: 'This Year' },
  { id: 'custom', label: 'Custom Range' },
];

const REPORT_TABS = ['daily', 'weekly', 'monthly', 'yearly'] as const;

function KpiCard({
  label,
  value,
  href,
  icon,
}: {
  label: string;
  value: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="rounded-xl bg-primary/10 p-2.5 text-primary">{icon}</div>
        <TrendingUp size={16} className="text-muted" />
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-2 text-xs font-medium text-primary">View sold books →</p>
    </Link>
  );
}

export function RevenueDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [preset, setPreset] = useState<RevenuePreset>('this_month');
  const [format, setFormat] = useState<SaleFormatFilter>(
    parseSaleFormatParam(searchParams.get('format')),
  );

  useEffect(() => {
    setFormat(parseSaleFormatParam(searchParams.get('format')));
  }, [searchParams]);

  const applyFormat = useCallback(
    (next: SaleFormatFilter) => {
      setFormat(next);
      const p = new URLSearchParams(searchParams.toString());
      if (next === 'all') p.delete('format');
      else p.set('format', next);
      router.replace(`/dashboard/revenue?${p.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [reportTab, setReportTab] = useState<(typeof REPORT_TABS)[number]>('daily');
  const [presetOpen, setPresetOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const query = useMemo(
    () => ({
      preset: preset === 'custom' ? 'custom' : preset,
      from: preset === 'custom' ? customFrom : undefined,
      to: preset === 'custom' ? customTo : undefined,
      format: format !== 'all' ? format : undefined,
    }),
    [preset, customFrom, customTo, format],
  );

  const { data, loading, error, refetch } = useAdminRevenueDashboard(query);
  const summary = data?.summary;
  const salesHref = `/dashboard/revenue/sales?preset=${preset}${
    preset === 'custom' && customFrom ? `&from=${customFrom}` : ''
  }${preset === 'custom' && customTo ? `&to=${customTo}` : ''}${
    format !== 'all' ? `&format=${format}` : ''
  }`;

  const reportRows = data?.reports?.[reportTab] ?? [];
  const exportRows = reportToExportRows(reportRows);

  const handleExport = (kind: 'csv' | 'xlsx' | 'pdf') => {
    const base = `booknest-revenue-${reportTab}-${preset}`;
    if (kind === 'csv') downloadCsv(`${base}.csv`, exportRows);
    else if (kind === 'xlsx') downloadExcel(`${base}.xlsx`, exportRows);
    else printAsPdf(`Revenue Report — ${reportTab}`, tableHtmlFromRows(exportRows));
    setExportOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminTopHeader adminSubtitle="Revenue Manager" />

      <div className="space-y-6 px-8 py-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Revenue & Sales</h1>
          <p className="mt-2 text-sm text-muted">
            Analytics and reports from completed book purchases in the database.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setPresetOpen((o) => !o)}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium"
            >
              {DATE_PRESETS.find((p) => p.id === preset)?.label ?? 'Period'}
              <ChevronDown size={16} />
            </button>
            {presetOpen && (
              <div className="absolute left-0 z-30 mt-1 min-w-[180px] rounded-lg border border-border bg-card py-1 shadow-lg">
                {DATE_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-surface"
                    onClick={() => {
                      setPreset(p.id);
                      setPresetOpen(false);
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <SaleFormatToggle value={format} onChange={applyFormat} disabled={loading} />
            {preset === 'custom' && (
              <>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
                />
                <span className="text-muted">to</span>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
                />
              </>
            )}
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <Link
              href="/dashboard/revenue/settings"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"
            >
              <Settings size={16} />
              Commission
            </Link>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {data && !data.tableReady && (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
            Sales tables are not in the database yet. Run{' '}
            <code className="rounded bg-black/10 px-1">npm run setup:revenue</code> in the backend
            (with SUPABASE_DB_URL) or execute{' '}
            <code className="rounded bg-black/10 px-1">admin-revenue-sales.sql</code> in Supabase SQL
            editor.
          </div>
        )}

        {data?.commissionPercent != null && (
          <p className="text-xs text-muted">
            Global commission rate: <strong>{data.commissionPercent}%</strong> (applied to new
            purchases; historical rows use stored rates)
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <KpiCard
            label="Total Revenue"
            value={loading ? '—' : formatEtb(summary?.totalRevenue ?? 0)}
            href={salesHref}
            icon={<DollarSign size={20} />}
          />
          <KpiCard
            label="Platform Commission"
            value={loading ? '—' : formatEtb(summary?.platformCommission ?? 0)}
            href={salesHref}
            icon={<TrendingUp size={20} />}
          />
          <KpiCard
            label="Author Earnings"
            value={loading ? '—' : formatEtb(summary?.authorEarnings ?? 0)}
            href={salesHref}
            icon={<Users size={20} />}
          />
          <KpiCard
            label="Books Sold"
            value={loading ? '—' : String(summary?.totalBooksSold ?? 0)}
            href={salesHref}
            icon={<BookOpen size={20} />}
          />
          <KpiCard
            label="Customers"
            value={loading ? '—' : String(summary?.totalCustomers ?? 0)}
            href={salesHref}
            icon={<Users size={20} />}
          />
          <KpiCard
            label="Active Authors"
            value={loading ? '—' : String(summary?.activeAuthors ?? 0)}
            href={salesHref}
            icon={<Users size={20} />}
          />
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Top Sold Books</h3>
          <TopSoldBooksButtons data={data?.charts.topBooks ?? []} loading={loading} />
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              {REPORT_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setReportTab(tab)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize ${
                    reportTab === tab
                      ? 'bg-primary text-white'
                      : 'bg-surface text-muted hover:text-foreground'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setExportOpen((o) => !o)}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold"
              >
                <Download size={14} />
                Export
              </button>
              {exportOpen && (
                <div className="absolute right-0 z-20 mt-1 rounded-lg border border-border bg-card py-1 shadow-lg">
                  {(['csv', 'xlsx', 'pdf'] as const).map((k) => (
                    <button
                      key={k}
                      type="button"
                      className="block w-full px-4 py-2 text-left text-xs uppercase hover:bg-surface"
                      onClick={() => handleExport(k)}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <PeriodReportTable
            rows={reportRows}
            loading={loading}
            periodLabel={
              reportTab === 'daily'
                ? 'Date'
                : reportTab === 'weekly'
                  ? 'Week'
                  : reportTab === 'monthly'
                    ? 'Month'
                    : 'Year'
            }
          />
        </div>
      </div>
    </div>
  );
}
