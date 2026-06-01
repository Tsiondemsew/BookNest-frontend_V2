'use client';

import { useCallback, useEffect, useState } from 'react';
import { getApiErrorMessage } from '@/lib/api-error';

export type UserRoleCounts = {
  users: number;
  authors: number;
  publishers: number;
};

export function useAdminUserRoleCounts() {
  const [counts, setCounts] = useState<UserRoleCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCounts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/users/stats', {
        credentials: 'include',
        cache: 'no-store',
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(getApiErrorMessage(payload, 'Failed to load user counts'));
      }
      const byRole = payload.data?.byRole;
      setCounts({
        users: byRole?.readers ?? 0,
        authors: byRole?.authors ?? 0,
        publishers: byRole?.publishers ?? 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user counts');
      setCounts(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  return { counts, loading, error, refetch: fetchCounts };
}
