'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';

export type RevenueAgreementStatus = {
  signed: boolean;
  version: string;
  acceptedAt: string | null;
  authorName: string | null;
  authorEmail: string | null;
  agreementText: string;
  authorSharePercent: number;
  platformSharePercent: number;
};

export function useAuthorRevenueAgreement() {
  const [status, setStatus] = useState<RevenueAgreementStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<{ success: boolean; data: RevenueAgreementStatus }>(
        '/api/authors/revenue-agreement',
      );
      setStatus(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agreement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sign = async (signatureName?: string) => {
    setSigning(true);
    setError(null);
    try {
      const res = await apiClient.post<{ success: boolean; data: RevenueAgreementStatus }>(
        '/api/authors/revenue-agreement',
        { accepted: true, signatureName },
      );
      setStatus(res.data);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign agreement');
      return false;
    } finally {
      setSigning(false);
    }
  };

  return { status, loading, signing, error, refetch: load, sign };
}
