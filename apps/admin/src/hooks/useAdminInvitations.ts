'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AdminInvitation, InvitationsListResponse, InvitationStatus, InvitationRoleType } from '@/features/invitations/types';
import { getApiErrorMessage } from '@/lib/api-error';

export function useAdminInvitations(options: {
  page?: number;
  limit?: number;
  search?: string;
  status?: InvitationStatus | '';
  roleType?: InvitationRoleType | '';
}) {
  const { page = 1, limit = 10, search = '', status = '', roleType = '' } = options;
  const [data, setData] = useState<InvitationsListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (search.trim()) params.set('search', search.trim());
      if (status) params.set('status', status);
      if (roleType) params.set('roleType', roleType);

      const res = await fetch(`/api/admin/invitations?${params}`, {
        credentials: 'include',
        cache: 'no-store',
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(getApiErrorMessage(payload, 'Failed to load invitations'));
      }
      setData(payload.data as InvitationsListResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invitations');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, roleType]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  return {
    invitations: (data?.items ?? []) as AdminInvitation[],
    pagination: data?.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 1 },
    storage: data?.storage,
    loading,
    error,
    refetch: fetchList,
  };
}
