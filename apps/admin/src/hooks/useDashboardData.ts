import { useEffect, useState } from 'react';
import type { DashboardStats, RevenueChartData, UserChartData, BookChartData } from '@repo/types';
import { ApiClient, apiConfig } from '@repo/api-client';

interface DashboardData {
  stats: DashboardStats | null;
  revenue: RevenueChartData[] | null;
  users: UserChartData[] | null;
  books: BookChartData[] | null;
  loading: boolean;
  error: string | null;
}

export function useDashboardData(): DashboardData {
  const [data, setData] = useState<DashboardData>({
    stats: null,
    revenue: null,
    users: null,
    books: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const client = new ApiClient(apiConfig);

        // Fetch all dashboard data in parallel
        const [stats, revenue, users, books] = await Promise.all([
          client.request('/api/admin/dashboard/stats'),
          client.request('/api/admin/dashboard/revenue'),
          client.request('/api/admin/dashboard/users'),
          client.request('/api/admin/dashboard/books'),
        ]);

        setData({
          stats: (stats as any).data,
          revenue: (revenue as any).data,
          users: (users as any).data,
          books: (books as any).data,
          loading: false,
          error: null,
        });
      } catch (error) {
        setData((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load dashboard data',
        }));
      }
    };

    fetchData();
  }, []);

  return data;
}
