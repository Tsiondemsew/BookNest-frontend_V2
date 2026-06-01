'use client';

import { useCallback, useEffect, useState } from 'react';
import type { UserGrowthData, UserGrowthRoleFilter } from '@/features/reports/types';
import { getApiErrorMessage } from '@/lib/api-error';
import type { AppliedReportPeriod } from '@/lib/report-period';
import { buildPeriodApiQuery } from '@/hooks/useReportPeriodQuery';

const EMPTY_TREND: UserGrowthData['signupsTrend'] = [];
const EMPTY_BY_ROLE: Record<UserGrowthRoleFilter, UserGrowthData['signupsTrend']> = {
  all: [],
  reader: [],
  author: [],
  publisher: [],
};

function normalizeUserGrowth(raw: unknown): UserGrowthData {
  const d = (raw && typeof raw === 'object' ? raw : {}) as Partial<UserGrowthData>;
  const summary = d.summary ?? {};
  const roleCounts = d.roleCounts ?? {};
  const readers = roleCounts.readers ?? summary.readers ?? 0;
  const authors = roleCounts.authors ?? summary.authors ?? 0;
  const publishers = roleCounts.publishers ?? summary.publishers ?? 0;

  const signupsTrendByRole = d.signupsTrendByRole ?? EMPTY_BY_ROLE;
  const monthlyTrendByRole = d.monthlyTrendByRole ?? EMPTY_BY_ROLE;

  return {
    days: d.days ?? 30,
    summary: {
      totalUsers: summary.totalUsers ?? 0,
      newSignupsInPeriod: summary.newSignupsInPeriod ?? 0,
      activeUsers24h: summary.activeUsers24h ?? 0,
      readers,
      authors,
      publishers,
      suspendedOrDisabled: summary.suspendedOrDisabled ?? 0,
    },
    signupsTrend: Array.isArray(d.signupsTrend) ? d.signupsTrend : signupsTrendByRole.all ?? EMPTY_TREND,
    signupsTrendByRole: {
      all: signupsTrendByRole.all ?? d.signupsTrend ?? EMPTY_TREND,
      reader: signupsTrendByRole.reader ?? EMPTY_TREND,
      author: signupsTrendByRole.author ?? EMPTY_TREND,
      publisher: signupsTrendByRole.publisher ?? EMPTY_TREND,
    },
    monthlyTrendByRole: {
      all: monthlyTrendByRole.all ?? EMPTY_TREND,
      reader: monthlyTrendByRole.reader ?? EMPTY_TREND,
      author: monthlyTrendByRole.author ?? EMPTY_TREND,
      publisher: monthlyTrendByRole.publisher ?? EMPTY_TREND,
    },
    comparisons: d.comparisons,
    roleCounts: {
      readers,
      authors,
      publishers,
      admins: roleCounts.admins ?? 0,
    },
    newByRole: {
      reader: d.newByRole?.reader ?? 0,
      author: d.newByRole?.author ?? 0,
      publisher: d.newByRole?.publisher ?? 0,
      admin: d.newByRole?.admin ?? 0,
    },
    signupGrowthChange: d.signupGrowthChange ?? 0,
    signupGrowthLabel: d.signupGrowthLabel ?? '0%',
  };
}

export function useAdminUserGrowth(
  period: AppliedReportPeriod | number = 30,
  enabled = true,
  fetchKey = 0,
) {
  const [data, setData] = useState<UserGrowthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const periodQuery =
    typeof period === 'number'
      ? `days=${encodeURIComponent(String(period))}`
      : buildPeriodApiQuery(period);

  const fetchUserGrowth = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reports/user-growth?${periodQuery}`, {
        credentials: 'include',
        cache: 'no-store',
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(getApiErrorMessage(payload, 'Failed to load user growth data'));
      }
      setData(normalizeUserGrowth(payload.data));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user growth data');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [periodQuery, enabled, fetchKey]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    fetchUserGrowth();
  }, [fetchUserGrowth, enabled, fetchKey]);

  return { data, loading, error, refetch: fetchUserGrowth };
}
