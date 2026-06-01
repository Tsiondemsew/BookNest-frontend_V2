'use client';

import { useRecentApprovals } from '@/hooks/useRecentApprovals';

export function RecentApprovals() {
  const { data, loading } = useRecentApprovals();

  if (loading) {
    return (
      <div className="rounded-3xl bg-card p-6 shadow-sm">
        Loading approvals...
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-5">
        <h2 className="text-2xl font-semibold text-foreground">
          Recent Approvals Queue
        </h2>

        <button className="text-sm font-medium text-primary hover:text-indigo-800">
          View All
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-surface">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                Book
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                Author
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                Date
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {data.map((item) => (
              <tr
                key={item.id}
                className="border-t border-border"
              >
                <td className="px-6 py-5">
                  <p className="font-medium text-foreground">
                    {item.title}
                  </p>
                </td>

                <td className="px-6 py-5 text-muted">
                  {item.author}
                </td>

                <td className="px-6 py-5 text-muted">
                  {new Date(
                    item.createdAt
                  ).toLocaleDateString()}
                </td>

                <td className="px-6 py-5">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      item.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}