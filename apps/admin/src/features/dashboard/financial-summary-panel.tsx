'use client';

import { Building2 } from 'lucide-react';
import type { DashboardOverviewData } from './types';

const BAR_COLORS = ['bg-[#1e3a5f]', 'bg-zinc-400', 'bg-sky-400'];

export function FinancialSummaryPanel({
  summary,
  topPerformer,
  loading,
}: {
  summary: DashboardOverviewData['financialSummary'];
  topPerformer: DashboardOverviewData['topPerformer'];
  loading?: boolean;
}) {
  if (loading) {
    return <div className="h-full min-h-[320px] animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />;
  }

  return (
    <div className="flex h-full flex-col">
      <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Financial Summary</h2>

      <div className="mt-8 flex-1 space-y-6">
        {summary.map((row, i) => (
          <div key={row.label}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-zinc-600 dark:text-zinc-400">{row.label}</span>
              <span className="font-bold text-zinc-900 dark:text-white">{row.formatted}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className={`h-full rounded-full transition-all ${BAR_COLORS[i] ?? 'bg-indigo-600'}`}
                style={{ width: `${Math.max(row.widthPct, 4)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t border-zinc-100 pt-6 dark:border-zinc-800">
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Top Performer</p>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-indigo-100 dark:from-sky-950 dark:to-indigo-950">
            <Building2 className="text-indigo-700 dark:text-indigo-300" size={24} />
          </div>
          <div>
            <p className="font-semibold text-zinc-900 dark:text-white">{topPerformer.name}</p>
            <p className="text-sm font-semibold text-emerald-600">{topPerformer.growth} growth</p>
            <p className="text-xs text-zinc-500">{topPerformer.subtitle}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
