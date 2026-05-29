'use client';

import { useCallback, useEffect, useState } from 'react';
import type { DashboardOverviewData } from '@/features/dashboard/types';
import { getApiErrorMessage } from '@/lib/api-error';

export function useAdminDashboard(days = 30) {
  const [data, setData] = useState<DashboardOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/dashboard/overview?days=${days}`, {
        credentials: 'include',
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(getApiErrorMessage(payload, 'Failed to load dashboard'));
      }
      setData(payload.data as DashboardOverviewData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return { data, loading, error, refetch: fetchOverview };
}
