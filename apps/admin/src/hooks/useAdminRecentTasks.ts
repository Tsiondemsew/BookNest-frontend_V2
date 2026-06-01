'use client';

import { useCallback, useEffect, useState } from 'react';
import { getApiErrorMessage } from '@/lib/api-error';

export type AdminTaskRow = {
  id: string;
  action: string;
  label: string;
  description: string;
  category: string;
  createdAt: string;
  adminId: string | null;
  adminName: string;
  adminEmail: string | null;
  bookId: string | null;
  bookTitle: string | null;
  targetUserId: string | null;
  targetUserEmail: string | null;
  details?: Record<string, unknown> | null;
};

type TasksResponse = {
  items: AdminTaskRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

function buildQuery(params: Record<string, string | number | undefined>) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : '';
}

export function useAdminRecentTasks(
  params: { search?: string; page?: number; limit?: number },
) {
  const [data, setData] = useState<TasksResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/tasks${buildQuery({
          search: params.search,
          page: params.page ?? 1,
          limit: params.limit ?? 15,
        })}`,
        { credentials: 'include' },
      );
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(getApiErrorMessage(payload, 'Failed to load admin tasks'));
      }
      setData(payload.data as TasksResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [params.search, params.page, params.limit]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks: data?.items ?? [],
    pagination: data?.pagination ?? { page: 1, limit: 15, total: 0, totalPages: 1 },
    loading,
    error,
    refetch: fetchTasks,
  };
}
