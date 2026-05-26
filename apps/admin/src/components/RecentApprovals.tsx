'use client';

import { useRecentApprovals } from '@/hooks/useRecentApprovals';

export function RecentApprovals() {
  const { data, loading } = useRecentApprovals();

  if (loading) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        Loading approvals...
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-5">
        <h2 className="text-2xl font-semibold text-zinc-900">
          Recent Approvals Queue
        </h2>

        <button className="text-sm font-medium text-indigo-700 hover:text-indigo-800">
          View All
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Book
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Author
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Date
              </th>

              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {data.map((item) => (
              <tr
                key={item.id}
                className="border-t border-zinc-100"
              >
                <td className="px-6 py-5">
                  <p className="font-medium text-zinc-900">
                    {item.title}
                  </p>
                </td>

                <td className="px-6 py-5 text-zinc-600">
                  {item.author}
                </td>

                <td className="px-6 py-5 text-zinc-600">
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