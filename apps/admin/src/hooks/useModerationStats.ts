'use client';

import { useCallback, useEffect, useState } from 'react';
import type { QueueStats } from '@/features/books/types';

export function useModerationStats() {
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/books/queue/stats', { credentials: 'include' });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(payload.error?.message || 'Failed to load moderation stats');
      }
      setStats(payload.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}
