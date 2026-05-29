'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { AdminUserStats, AdminUsersResponse, UserSegmentFilter } from '@/features/users/types';
import { getApiErrorMessage } from '@/lib/api-error';
import type { UserRoleFilter } from '@/features/users/export-users-modal';

type FetchUsersOptions = {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRoleFilter;
  segment?: UserSegmentFilter;
};

export function useAdminUsers(options: {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRoleFilter;
  segment?: UserSegmentFilter;
}) {
  const { page = 1, limit = 10, search = '', role = '', segment = 'all' } = options;

  const [stats, setStats] = useState<AdminUserStats | null>(null);
  const [users, setUsers] = useState<AdminUsersResponse['items']>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const listRequestId = useRef(0);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const statsRes = await fetch('/api/admin/users/stats', {
        credentials: 'include',
        cache: 'no-store',
      });
      const statsPayload = await statsRes.json();
      if (!statsRes.ok || !statsPayload.success) {
        throw new Error(getApiErrorMessage(statsPayload, 'Failed to load user stats'));
      }
      setStats(statsPayload.data as AdminUserStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user stats');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async (overrides: FetchUsersOptions = {}) => {
    const requestId = ++listRequestId.current;
    const activePage = overrides.page ?? page;
    const activeLimit = overrides.limit ?? limit;
    const activeSearch = overrides.search ?? search;
    const activeRole = overrides.role ?? role;
    const activeSegment = overrides.segment ?? segment;

    setListLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: String(activePage),
        limit: String(activeLimit),
      });
      if (activeSearch.trim()) params.set('search', activeSearch.trim());
      if (activeRole) params.set('role', activeRole);
      if (activeSegment && activeSegment !== 'all') params.set('segment', activeSegment);

      const usersRes = await fetch(`/api/admin/users?${params.toString()}`, {
        credentials: 'include',
        cache: 'no-store',
      });
      const usersPayload = await usersRes.json();

      if (requestId !== listRequestId.current) return;

      if (!usersRes.ok || !usersPayload.success) {
        throw new Error(getApiErrorMessage(usersPayload, 'Failed to load users'));
      }

      const data = usersPayload.data as AdminUsersResponse;
      setUsers(data.items ?? []);
      setPagination(data.pagination);
    } catch (err) {
      if (requestId !== listRequestId.current) return;
      setError(err instanceof Error ? err.message : 'Failed to load users');
      setUsers([]);
    } finally {
      if (requestId === listRequestId.current) {
        setListLoading(false);
      }
    }
  }, [page, limit, search, role, segment]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const refetch = useCallback(async () => {
    await Promise.all([fetchStats(), fetchUsers()]);
  }, [fetchStats, fetchUsers]);

  return {
    stats,
    users,
    pagination,
    statsLoading,
    listLoading,
    loading: statsLoading || listLoading,
    error,
    refetch,
    fetchUsers,
  };
}
