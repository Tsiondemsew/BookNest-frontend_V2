'use client';

import { useCallback, useEffect, useState } from 'react';
import type { RevenueDashboardData, RevenueSalesResponse } from '@/features/revenue/types';
import { getApiErrorMessage } from '@/lib/api-error';

function buildQuery(params: Record<string, string | number | undefined | null>) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : '';
}

export function useAdminRevenueDashboard(
  params: Record<string, string | number | undefined | null>,
) {
  const [data, setData] = useState<RevenueDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/revenue/dashboard${buildQuery(params)}`, {
        credentials: 'include',
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(getApiErrorMessage(payload, 'Failed to load revenue dashboard'));
      }
      setData(payload.data as RevenueDashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load revenue');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useAdminRevenueSales(
  params: Record<string, string | number | undefined | null>,
) {
  const [data, setData] = useState<RevenueSalesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/revenue/sales${buildQuery(params)}`, {
        credentials: 'include',
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(getApiErrorMessage(payload, 'Failed to load sales'));
      }
      setData(payload.data as RevenueSalesResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sales');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useRevenueSettings() {
  const [commissionPercent, setCommissionPercent] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/revenue/settings', { credentials: 'include' });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(getApiErrorMessage(payload, 'Failed to load settings'));
      }
      setCommissionPercent(payload.data.commissionPercent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  const save = useCallback(async (percent: number) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/revenue/settings', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commissionPercent: percent }),
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(getApiErrorMessage(payload, 'Failed to save settings'));
      }
      setCommissionPercent(payload.data.commissionPercent);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { commissionPercent, loading, saving, error, save, reload: load };
}
