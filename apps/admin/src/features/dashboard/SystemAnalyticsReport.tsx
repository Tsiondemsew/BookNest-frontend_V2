'use client';

import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  BookOpen,
  TrendingUp,
  Users,
  Loader2,
} from 'lucide-react';
import type { AdminSystemAnalytics } from '@repo/api-client';
import { adminApi } from '@/lib/api/client';
import { AdminCard } from '@/components/ui/AdminUi';

function formatRole(role: string) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function formatStatus(status: string) {
  return status.replace(/_/g, ' ');
}

function CountBarChart({
  data,
  valueKey,
  colorClass,
  emptyLabel,
}: {
  data: Array<{ date: string; count?: number; sales?: number; revenue?: number }>;
  valueKey: 'count' | 'revenue';
  colorClass: string;
  emptyLabel: string;
}) {
  const values = data.map((d) =>
    valueKey === 'count' ? d.count ?? 0 : d.revenue ?? 0
  );
  const max = Math.max(...values, 1);
  const hasData = values.some((v) => v > 0);

  return (
    <div>
      <div className="flex items-end gap-0.5 h-44 border-b border-[#E8E2D9] pb-1">
        {data.map((day) => {
          const value = valueKey === 'count' ? day.count ?? 0 : day.revenue ?? 0;
          const heightPct = value > 0 ? Math.max(8, (value / max) * 100) : 2;
          const title =
            valueKey === 'count'
              ? `${day.date}: ${day.count ?? 0}`
              : `${day.date}: ${Number(day.revenue ?? 0).toFixed(2)} ETB · ${day.sales ?? 0} orders`;
          return (
            <div
              key={day.date}
              className="flex-1 flex flex-col items-center justify-end min-w-0 h-full"
              title={title}
            >
              <div
                className={`w-full rounded-t min-w-[3px] ${value > 0 ? colorClass : 'bg-[#E8E2D9]'}`}
                style={{ height: `${heightPct}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2 text-[10px] text-[#4A5568]">
        <span>{data[0]?.date.slice(5)}</span>
        <span>{data[data.length - 1]?.date.slice(5)}</span>
      </div>
      {!hasData && <p className="text-sm text-[#4A5568] mt-3">{emptyLabel}</p>}
    </div>
  );
}

function HorizontalBreakdown({
  items,
  labelKey,
  formatLabel,
  barColor,
}: {
  items: Array<{ role?: string; status?: string; count: number }>;
  labelKey: 'role' | 'status';
  formatLabel: (value: string) => string;
  barColor: string;
}) {
  const max = Math.max(...items.map((i) => i.count), 1);

  if (!items.length) {
    return <p className="text-sm text-[#4A5568]">No data yet.</p>;
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const label = formatLabel(String(item[labelKey] ?? 'unknown'));
        const widthPct = Math.max(4, (item.count / max) * 100);
        return (
          <li key={label}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-[#1A2A3A] capitalize">{label}</span>
              <span className="text-[#4A5568]">{item.count}</span>
            </div>
            <div className="h-2 bg-[#E8E2D9] rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${barColor}`} style={{ width: `${widthPct}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function SystemAnalyticsCharts({ analytics }: { analytics: AdminSystemAnalytics }) {
  const salesTotal30 = analytics.sales_over_time.reduce((s, d) => s + d.revenue, 0);
  const usersNew30 = analytics.users_over_time.reduce((s, d) => s + d.count, 0);
  const booksNew30 = analytics.books_over_time.reduce((s, d) => s + d.count, 0);

  return (
    <div className="mt-10 space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-[#1A2A3A]">System analysis report</h2>
        <p className="text-sm text-[#4A5568] mt-1">
          Platform trends over the last {analytics.period_days} days — users, books, and sales.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <AdminCard className="p-4">
          <p className="text-xs text-[#4A5568]">New users (30d)</p>
          <p className="text-2xl font-semibold text-[#2C3E50] mt-1">{usersNew30}</p>
        </AdminCard>
        <AdminCard className="p-4">
          <p className="text-xs text-[#4A5568]">Books added (30d)</p>
          <p className="text-2xl font-semibold text-[#2C3E50] mt-1">{booksNew30}</p>
        </AdminCard>
        <AdminCard className="p-4">
          <p className="text-xs text-[#4A5568]">Gross sales (30d, ETB)</p>
          <p className="text-2xl font-semibold text-[#2C3E50] mt-1">
            {salesTotal30.toFixed(2)}
          </p>
        </AdminCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCard className="p-6">
          <h3 className="font-semibold text-[#1A2A3A] flex items-center gap-2 mb-1">
            <TrendingUp size={18} className="text-[#B85C38]" />
            Sales revenue
          </h3>
          <p className="text-xs text-[#4A5568] mb-4">Completed checkout totals per day</p>
          <CountBarChart
            data={analytics.sales_over_time}
            valueKey="revenue"
            colorClass="bg-[#B85C38]"
            emptyLabel="No completed sales in the last 30 days."
          />
        </AdminCard>

        <AdminCard className="p-6">
          <h3 className="font-semibold text-[#1A2A3A] flex items-center gap-2 mb-1">
            <Users size={18} className="text-[#B85C38]" />
            User sign-ups
          </h3>
          <p className="text-xs text-[#4A5568] mb-4">New accounts registered per day</p>
          <CountBarChart
            data={analytics.users_over_time}
            valueKey="count"
            colorClass="bg-[#2C3E50]"
            emptyLabel="No new users in the last 30 days."
          />
        </AdminCard>

        <AdminCard className="p-6">
          <h3 className="font-semibold text-[#1A2A3A] flex items-center gap-2 mb-1">
            <BookOpen size={18} className="text-[#B85C38]" />
            Books catalogued
          </h3>
          <p className="text-xs text-[#4A5568] mb-4">New book records created per day</p>
          <CountBarChart
            data={analytics.books_over_time}
            valueKey="count"
            colorClass="bg-[#4A6FA5]"
            emptyLabel="No new books in the last 30 days."
          />
        </AdminCard>

        <AdminCard className="p-6">
          <h3 className="font-semibold text-[#1A2A3A] flex items-center gap-2 mb-1">
            <BarChart3 size={18} className="text-[#B85C38]" />
            Top selling books
          </h3>
          <p className="text-xs text-[#4A5568] mb-4">All-time gross revenue by title</p>
          {!analytics.top_books.length ? (
            <p className="text-sm text-[#4A5568]">No sales recorded yet.</p>
          ) : (
            <ul className="space-y-3">
              {analytics.top_books.map((book, index) => {
                const maxRev = analytics.top_books[0]?.revenue || 1;
                const widthPct = Math.max(6, (book.revenue / maxRev) * 100);
                return (
                  <li key={book.book_id}>
                    <div className="flex justify-between gap-2 text-sm mb-1">
                      <span className="font-medium text-[#1A2A3A] truncate">
                        {index + 1}. {book.title}
                      </span>
                      <span className="text-[#4A5568] shrink-0">
                        {book.copies_sold} · {book.revenue.toFixed(2)} ETB
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#E8E2D9] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#2C3E50] to-[#B85C38] rounded-full"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </AdminCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCard className="p-6">
          <h3 className="font-semibold text-[#1A2A3A] mb-1">Users by role</h3>
          <p className="text-xs text-[#4A5568] mb-4">Current account distribution</p>
          <HorizontalBreakdown
            items={analytics.users_by_role}
            labelKey="role"
            formatLabel={formatRole}
            barColor="bg-[#2C3E50]"
          />
        </AdminCard>

        <AdminCard className="p-6">
          <h3 className="font-semibold text-[#1A2A3A] mb-1">Books by status</h3>
          <p className="text-xs text-[#4A5568] mb-4">Catalog workflow breakdown</p>
          <HorizontalBreakdown
            items={analytics.books_by_status}
            labelKey="status"
            formatLabel={formatStatus}
            barColor="bg-[#B85C38]"
          />
        </AdminCard>
      </div>
    </div>
  );
}

export function SystemAnalyticsReport() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: () => adminApi.getSystemAnalytics(),
  });

  if (isLoading) {
    return (
      <div className="mt-10 flex items-center gap-2 text-[#4A5568]">
        <Loader2 className="w-5 h-5 animate-spin text-[#B85C38]" />
        Loading analytics charts…
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <p className="mt-10 text-red-600 text-sm">
        Could not load system analytics. Restart the backend if you recently deployed changes.
      </p>
    );
  }

  return <SystemAnalyticsCharts analytics={data.data} />;
}
