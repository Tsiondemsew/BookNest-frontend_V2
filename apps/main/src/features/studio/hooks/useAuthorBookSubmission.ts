'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import type { RevenueAgreementStatus } from './useAuthorRevenueAgreement';

export type BookFormatView = {
  id: string | null;
  formatType: string;
  price: number | null;
  currency: string;
  fileUrl: string | null;
  fileName: string | null;
  durationSec: number | null;
  pageCount: number | null;
  fileSizeBytes: number | null;
  uploadedAt: string | null;
};

export type AuthorBookSubmission = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  status: string;
  reviewNote: string | null;
  language: string;
  coverImageUrl: string | null;
  genre: string | null;
  submittedAt: string;
  formats: BookFormatView[];
  isUpdateSubmission: boolean;
  updateNote: string | null;
  updateRequest: { id: string; status: string; submittedAt: string; updateNote: string | null } | null;
  descriptionComparison: { previous: string | null; current: string | null } | null;
  changes: { label: string; previous: string | null; proposed: string | null }[];
  contentComparison: {
    pdf: { previous: BookFormatView | null; current: BookFormatView | null };
    audio: { previous: BookFormatView | null; current: BookFormatView | null };
  } | null;
  revenueAgreement: RevenueAgreementStatus;
  canSubmitForReview: boolean;
  mustSignAgreement: boolean;
};

export function useAuthorBookSubmission(bookId: string) {
  const [data, setData] = useState<AuthorBookSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!bookId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<{ success: boolean; data: AuthorBookSubmission }>(
        `/api/books/${bookId}/submission`,
      );
      setData(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load book');
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
}
