'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ReportsCenterData } from '@/features/reports/types';
import type { SaleFormatFilter } from '@/features/reports/types';
import { getApiErrorMessage } from '@/lib/api-error';

export type ReportsQuery = {
  days?: number;
  preset?: string;
  from?: string;
  to?: string;
  format?: SaleFormatFilter;
};

function buildReportsQuery(params: ReportsQuery) {
  const q = new URLSearchParams();
  if (params.preset === 'custom' && params.from && params.to) {
    q.set('preset', 'custom');
    q.set('from', params.from);
    q.set('to', params.to);
    if (params.days) q.set('days', String(params.days));
  } else if (params.days) {
    q.set('days', String(params.days));
  }
  if (params.format && params.format !== 'all') {
    q.set('format', params.format);
  }
  return q.toString();
}

export function useAdminReports(params: ReportsQuery = { days: 30 }) {
  const [data, setData] = useState<ReportsCenterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setData(null);
    setError(null);
    try {
      const query = buildReportsQuery(params);
      const res = await fetch(`/api/admin/reports${query ? `?${query}` : ''}`, {
        credentials: 'include',
        cache: 'no-store',
      });
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
  }, [
    params.days,
    params.preset,
    params.from,
    params.to,
    params.format,
  ]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return { data, loading, error, refetch: fetchReports };
}
