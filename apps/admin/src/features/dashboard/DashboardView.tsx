'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/client';

export function DashboardView() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminApi.getDashboard(),
  });

  const stats = data?.data;

  if (isLoading) return <p className="text-zinc-500">Loading stats…</p>;
  if (error) return <p className="text-red-600">Failed to load dashboard.</p>;

  const cards = [
    { label: 'Total users', value: stats?.total_users ?? 0 },
    { label: 'Total books', value: stats?.total_books ?? 0 },
    { label: 'Pending books', value: stats?.pending_books ?? 0 },
    { label: 'Pending reports', value: stats?.pending_reports ?? 0 },
    { label: 'Pending withdrawals', value: stats?.pending_withdrawals ?? 0 },
    { label: 'Total revenue (ETB)', value: stats?.total_revenue ?? 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">System overview</h1>
      <p className="mt-1 text-sm text-zinc-500">Platform-wide metrics at a glance.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-zinc-200 bg-white p-5">
            <p className="text-sm text-zinc-500">{c.label}</p>
            <p className="mt-2 text-3xl font-semibold text-zinc-900">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
