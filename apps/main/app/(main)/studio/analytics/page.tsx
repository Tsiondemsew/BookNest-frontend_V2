'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/api/client';
import { Loader2, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function StudioAnalyticsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['analytics', 'sales'],
    queryFn: () => analyticsApi.getSalesAnalytics(),
  });

  const analytics = data?.data;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-[#B85C38]" size={40} />
      </div>
    );
  }

  if (isError || !analytics) {
    return <p className="text-red-500 p-6">Failed to load analytics.</p>;
  }

  const summary = analytics.summary;
  const maxRevenue = Math.max(
    ...(analytics.sales_over_time?.map((d: { revenue: number }) => d.revenue) || [1]),
    1
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2A3A]">Sales Analytics</h1>
          <p className="text-[#4A5568]">Performance of your catalog (last 30 days)</p>
        </div>
        <Link
          href="/studio/earnings"
          className="text-sm text-[#B85C38] hover:underline"
        >
          Earnings & withdrawals →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Books', value: summary.total_books },
          { label: 'Copies sold', value: summary.total_copies_sold },
          { label: 'Revenue (ETB)', value: summary.total_revenue?.toFixed?.(2) ?? summary.total_revenue },
          { label: 'Pending review', value: summary.pending_approval },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-[#E8E2D9] rounded-xl p-4">
            <p className="text-2xl font-bold text-[#1A2A3A]">{s.value}</p>
            <p className="text-xs text-[#4A5568]">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#E8E2D9] rounded-xl p-6">
        <h2 className="font-semibold text-[#1A2A3A] mb-4 flex items-center gap-2">
          <TrendingUp size={18} /> Sales over time
        </h2>
        {analytics.sales_over_time?.length ? (
          <div className="flex items-end gap-2 h-40">
            {analytics.sales_over_time.map((day: { date: string; sales: number; revenue: number }) => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-[#B85C38] rounded-t min-h-[4px]"
                  style={{ height: `${(day.revenue / maxRevenue) * 100}%` }}
                  title={`${day.revenue} ETB`}
                />
                <span className="text-[10px] text-[#4A5568] rotate-0 truncate w-full text-center">
                  {day.date.slice(5)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[#4A5568] text-sm">No sales in the last 30 days yet.</p>
        )}
      </div>

      <div className="bg-white border border-[#E8E2D9] rounded-xl p-6">
        <h2 className="font-semibold text-[#1A2A3A] mb-4">Top books</h2>
        <ul className="space-y-3">
          {(analytics.top_books || []).map(
            (b: { book_id: string; title: string; copies_sold: number; revenue: number }) => (
              <li key={b.book_id} className="flex justify-between text-sm border-b border-[#E8E2D9] pb-2">
                <span className="font-medium text-[#1A2A3A]">{b.title}</span>
                <span className="text-[#4A5568]">
                  {b.copies_sold} sold · {Number(b.revenue).toFixed(2)} ETB
                </span>
              </li>
            )
          )}
        </ul>
      </div>
    </div>
  );
}
