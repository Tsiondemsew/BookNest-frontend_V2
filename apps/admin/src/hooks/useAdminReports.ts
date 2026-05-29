'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ReportsCenterData } from '@/features/reports/types';
import { getApiErrorMessage } from '@/lib/api-error';

export function useAdminReports(days = 30) {
  const [data, setData] = useState<ReportsCenterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reports?days=${days}`, { credentials: 'include' });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(getApiErrorMessage(payload, 'Failed to load reports'));
      }
      setData(payload.data as ReportsCenterData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return { data, loading, error, refetch: fetchReports };
}
