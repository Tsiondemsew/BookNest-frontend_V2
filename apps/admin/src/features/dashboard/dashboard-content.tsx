'use client';

import {
  Activity,
  AlertTriangle,
  ChevronDown,
  DollarSign,
  Download,
  TrendingDown,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { AdminTopHeader } from '@/components/admin-top-header';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { FinancialSummaryPanel } from './financial-summary-panel';
import { RecentApprovalsTable } from './recent-approvals-table';
import { UsabilityIndexChart } from './usability-index-chart';

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
}: {
  label: string;
  value: string;
  badge?: string;
  badgeClass?: string;
  sublabel?: string;
  icon: React.ReactNode;
  iconBg: string;
  footer?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
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
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-zinc-900 dark:text-white">{value}</p>
      {sublabel && <p className="mt-1 text-xs text-zinc-500">{sublabel}</p>}
      {footer}
    </div>
  );
}

function HealthBars() {
  return (
    <div className="mt-3 flex gap-1">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className={`h-6 w-2 rounded-sm ${i < 10 ? 'bg-emerald-500' : 'bg-emerald-200'}`}
        />
      ))}
    </div>
  );
}

export function DashboardContent() {
  const [searchInput, setSearchInput] = useState('');
  const [days, setDays] = useState(30);
  const [rangeOpen, setRangeOpen] = useState(false);

  const { data, loading, error, refetch } = useAdminDashboard(days);
  const rangeLabel = DATE_RANGES.find((r) => r.days === days)?.label ?? 'Last 30 Days';

  const handleExport = () => {
    if (!data) return;
    const lines = [
      'Metric,Value',
      `Monthly Revenue,${data.metrics.monthlyRevenue.formatted}`,
      `System Health,${data.metrics.systemHealth.formatted}`,
      `Active Users,${data.metrics.activeUsers.value}`,
      `Pending Approvals,${data.metrics.pendingApprovals.value}`,
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
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-zinc-950">
      <AdminTopHeader
        searchPlaceholder="Search system resources..."
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        adminSubtitle="Super Administrator"
      />

      <div className="px-8 py-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#1e3a5f] dark:text-white">
              System Overview
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Real-time performance and financial tracking
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
              disabled={loading || !data}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1e3a5f] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#152a45] disabled:opacity-50"
            >
              <Download size={18} />
              Export Report
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
          <KpiCard
            label="Monthly Revenue"
            value={loading ? '—' : data?.metrics.monthlyRevenue.formatted ?? '0 ETB'}
            badge={loading ? undefined : data?.metrics.monthlyRevenue.changeLabel}
            badgeClass={
              (data?.metrics.monthlyRevenue.change ?? 0) >= 0
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-red-100 text-red-700'
            }
            icon={<DollarSign size={20} className="text-violet-600" />}
            iconBg="bg-violet-50"
          />
          <KpiCard
            label="System Health"
            value={loading ? '—' : data?.metrics.systemHealth.formatted ?? '99.98%'}
            badge={loading ? undefined : data?.metrics.systemHealth.status}
            badgeClass="bg-emerald-100 text-emerald-700"
            icon={<Activity size={20} className="text-emerald-600" />}
            iconBg="bg-emerald-50"
            footer={!loading ? <HealthBars /> : undefined}
          />
          <KpiCard
            label="Active Users"
            value={loading ? '—' : (data?.metrics.activeUsers.value ?? 0).toLocaleString()}
            badge={loading ? undefined : data?.metrics.activeUsers.changeLabel}
            badgeClass={
              (data?.metrics.activeUsers.change ?? 0) >= 0
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-red-100 text-red-700'
            }
            sublabel={
              loading
                ? undefined
                : `${(data?.metrics.activeUsers.online ?? 0).toLocaleString()} online currently`
            }
            icon={<Users size={20} className="text-sky-600" />}
            iconBg="bg-sky-50"
            footer={
              !loading && data ? (
                <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-red-600">
                  <TrendingDown size={12} />
                  {data.metrics.activeUsers.changeLabel}
                </div>
              ) : undefined
            }
          />
          <KpiCard
            label="Pending Approvals"
            value={loading ? '—' : String(data?.metrics.pendingApprovals.value ?? 0)}
            badge={
              data?.metrics.pendingApprovals.actionRequired ? 'Action Required' : undefined
            }
            badgeClass="bg-red-100 text-red-700"
            sublabel={
              loading
                ? undefined
                : `${data?.metrics.pendingApprovals.urgent ?? 0} urgent priority`
            }
            icon={<AlertTriangle size={20} className="text-amber-600" />}
            iconBg="bg-amber-50"
          />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-5">
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm xl:col-span-3 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                System Usability Index
              </h2>
              <div className="hidden items-center gap-4 text-xs text-zinc-500 sm:flex">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#1e3a5f]" />
                  Backend Load
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
                  Response Time
                </span>
              </div>
            </div>
            <UsabilityIndexChart data={data?.usabilityIndex ?? []} loading={loading} />
          </div>

          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm xl:col-span-2 dark:border-zinc-800 dark:bg-zinc-900">
            <FinancialSummaryPanel
              summary={data?.financialSummary ?? []}
              topPerformer={data?.topPerformer ?? { name: '—', growth: '—', subtitle: '' }}
              loading={loading}
            />
          </div>
        </div>

        <div className="mt-8">
          <RecentApprovalsTable rows={data?.recentApprovals ?? []} loading={loading} />
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
