'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { adminApi } from '@/lib/api/client';
import { AdminCard } from '@/components/ui/AdminUi';
import { SystemAnalyticsReport } from './SystemAnalyticsReport';
export function DashboardView() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminApi.getDashboard(),
  });

  const stats = data?.data;

  if (isLoading) return <p className="text-[#4A5568]">Loading stats…</p>;
  if (error) return <p className="text-red-600">Failed to load dashboard.</p>;

  const cards = [
    { label: 'Total users', value: stats?.total_users ?? 0, href: '/dashboard/users' },
    { label: 'Total books', value: stats?.total_books ?? 0, href: '/dashboard/books' },
    { label: 'Pending books', value: stats?.pending_books ?? 0, href: '/dashboard/books' },
    { label: 'Pending reports', value: stats?.pending_reports ?? 0, href: '/dashboard/reports' },
    {
      label: 'Pending withdrawals',
      value: stats?.pending_withdrawals ?? 0,
      href: '/dashboard/withdrawals',
    },
    { label: 'Total revenue (ETB)', value: stats?.total_revenue ?? 0, href: null },
    { label: 'Platform income (ETB)', value: stats?.platform_income ?? 0, href: null },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[#1A2A3A]">System overview</h1>
      <p className="mt-1 text-sm text-[#4A5568]">Platform-wide metrics at a glance.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => {
          const inner = (
            <>
              <p className="text-sm text-[#4A5568]">{c.label}</p>
              <p className="mt-2 text-3xl font-semibold text-[#2C3E50]">{c.value}</p>
            </>
          );
          return c.href ? (
            <Link key={c.label} href={c.href}>
              <AdminCard className="p-5 hover:border-[#B85C38]/40 transition-colors">{inner}</AdminCard>
            </Link>
          ) : (
            <AdminCard key={c.label} className="p-5">
              {inner}
            </AdminCard>
          );
        })}
      </div>

      <SystemAnalyticsReport />
    </div>
  );
}
