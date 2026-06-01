'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ErrorLogItem, ErrorLogsData } from '@/features/reports/error-log-types';
import { getApiErrorMessage } from '@/lib/api-error';

export function useAdminErrorLogs(params: {
  days?: number;
  from?: string;
  to?: string;
  hours?: number;
  page?: number;
  limit?: number;
  level?: string;
  search?: string;
  status?: 'all' | 'unresolved' | 'resolved';
}) {
  const [data, setData] = useState<ErrorLogsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildQuery = useCallback(
    (overrides?: { page?: number }) => {
      const q = new URLSearchParams();
      q.set('page', String(overrides?.page ?? params.page ?? 1));
      q.set('limit', String(params.limit ?? 25));
      if (params.hours) {
        q.set('hours', String(params.hours));
      } else if (params.from && params.to) {
        q.set('preset', 'custom');
        q.set('from', params.from);
        q.set('to', params.to);
        q.set('days', String(params.days ?? 30));
      } else {
        q.set('days', String(params.days ?? 30));
      }
      if (params.level && params.level !== 'all') q.set('level', params.level);
      if (params.search?.trim()) q.set('search', params.search.trim());
      if (params.status === 'unresolved') q.set('resolved', 'false');
      else if (params.status === 'resolved') q.set('resolved', 'true');
      return q;
    },
    [
      params.days,
      params.from,
      params.to,
      params.hours,
      params.page,
      params.limit,
      params.level,
      params.search,
      params.status,
    ],
  );

  const fetchLogs = useCallback(
    async (options?: { silent?: boolean }) => {
      if (options?.silent) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      try {
        const res = await fetch(`/api/admin/error-logs?${buildQuery()}`, {
          credentials: 'include',
          cache: 'no-store',
        });
        const payload = await res.json();
        if (!res.ok || !payload.success) {
          throw new Error(getApiErrorMessage(payload, 'Failed to load error logs'));
        }
        setData(payload.data as ErrorLogsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load error logs');
        if (!options?.silent) setData(null);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [buildQuery],
  );

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const refetch = useCallback(() => fetchLogs({ silent: true }), [fetchLogs]);

  const resolveLog = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/admin/error-logs/${id}/resolve`, {
        method: 'PATCH',
        credentials: 'include',
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(getApiErrorMessage(payload, 'Failed to resolve log'));
      }
      await fetchLogs({ silent: true });
      return payload.data as ErrorLogItem;
    },
    [fetchLogs],
  );

  const unresolveLog = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/admin/error-logs/${id}/unresolve`, {
        method: 'PATCH',
        credentials: 'include',
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(getApiErrorMessage(payload, 'Failed to reopen log'));
      }
      await fetchLogs({ silent: true });
      return payload.data as ErrorLogItem;
    },
    [fetchLogs],
  );

  const exportLogs = useCallback(async (): Promise<ErrorLogItem[]> => {
    const res = await fetch(`/api/admin/error-logs/export?${buildQuery({ page: 1 })}`, {
      credentials: 'include',
      cache: 'no-store',
    });
    const payload = await res.json();
    if (!res.ok || !payload.success) {
      throw new Error(getApiErrorMessage(payload, 'Failed to export error logs'));
    }
    return (payload.data?.items ?? []) as ErrorLogItem[];
  }, [buildQuery]);

  return {
    data,
    loading,
    isRefreshing,
    error,
    refetch,
    resolveLog,
    unresolveLog,
    exportLogs,
  };
}
