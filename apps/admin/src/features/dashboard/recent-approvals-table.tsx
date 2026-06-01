'use client';

import Link from 'next/link';
import type { DashboardOverviewData } from './types';

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function StatusBadge({ status }: { status: DashboardOverviewData['recentApprovals'][0]['status'] }) {
  if (status === 'approved') {
    return (
      <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
        Approved
      </span>
    );
  }
  if (status === 'rejected') {
    return (
      <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-red-700">
        Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-800">
      Pending
    </span>
  );
}

const AVATAR_COLORS = [
  'from-violet-500 to-purple-600',
  'from-sky-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
];

export function RecentApprovalsTable({
  rows,
  loading,
}: {
  rows: DashboardOverviewData['recentApprovals'];
  loading?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-6 py-4 dark:border-border">
        <h2 className="text-base font-bold text-foreground">Recent Approvals Queue</h2>
        <Link
          href="/dashboard/books"
          className="text-xs font-semibold text-accent hover:underline"
        >
          View All Tasks
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/80 text-[10px] font-bold uppercase tracking-wider text-muted dark:border-border dark:bg-surface/50">
              <th className="px-6 py-3">Submission ID</th>
              <th className="px-4 py-3">Submitter</th>
              <th className="px-4 py-3">Asset Category</th>
              <th className="px-4 py-3">Date Received</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  <td colSpan={6} className="px-6 py-4">
                    <div className="h-4 animate-pulse rounded bg-border dark:bg-border" />
                  </td>
                </tr>
              ))}

            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-muted">
                  No submissions yet.
                </td>
              </tr>
            )}

            {!loading &&
              rows.map((row, i) => (
                <tr
                  key={row.id}
                  className="border-b border-border transition hover:bg-surface/50 dark:border-border dark:hover:bg-primary/90/30"
                >
                  <td className="px-6 py-3.5 font-mono text-xs font-semibold text-foreground dark:text-zinc-200">
                    #{row.submissionId}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
                      >
                        {initials(row.submitter)}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{row.submitter}</p>
                        {row.submitterEmail && (
                          <p className="text-xs text-muted">{row.submitterEmail}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-muted">{row.assetCategory}</td>
                  <td className="px-4 py-3.5 text-muted">{row.dateReceived}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-4 py-3.5">
                    <Link
                      href={`/dashboard/books/${row.id}`}
                      className="text-xs font-semibold text-accent hover:underline"
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
