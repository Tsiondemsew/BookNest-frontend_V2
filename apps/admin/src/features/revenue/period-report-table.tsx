'use client';

import type { PeriodReportRow } from './types';
import { formatEtb } from './export-utils';

export function PeriodReportTable({
  rows,
  loading,
  periodLabel,
}: {
  rows: PeriodReportRow[];
  loading?: boolean;
  periodLabel: string;
}) {
  if (loading) {
    return <div className="h-32 animate-pulse rounded-xl bg-surface" />;
  }

  if (!rows.length) {
    return (
      <p className="py-8 text-center text-sm text-muted">No sales in this period.</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-border bg-surface/80 text-xs uppercase tracking-wider text-muted">
          <tr>
            <th className="px-4 py-3">{periodLabel}</th>
            <th className="px-4 py-3">Books Sold</th>
            <th className="px-4 py-3">Revenue</th>
            <th className="px-4 py-3">Commission</th>
            <th className="px-4 py-3">Author Earnings</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.period} className="border-b border-border/60 last:border-0">
              <td className="px-4 py-3 font-medium text-foreground">{r.period}</td>
              <td className="px-4 py-3 text-muted">{r.booksSold}</td>
              <td className="px-4 py-3">{formatEtb(r.revenue)}</td>
              <td className="px-4 py-3">{formatEtb(r.commission)}</td>
              <td className="px-4 py-3">{formatEtb(r.authorEarnings)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
