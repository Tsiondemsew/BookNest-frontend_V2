'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { booksApi } from '@/lib/api/client';
import { useAuthStore } from '@/stores/authStore';

const EMPTY_OWNED_IDS: string[] = [];

export function useBookPurchaseStatus(bookId: string) {
  const { isAuthenticated } = useAuthStore();

  const query = useQuery({
    queryKey: ['book-purchase-status', bookId],
    queryFn: async () => {
      const res = await booksApi.getPurchaseStatus(bookId);
      return res.data;
    },
    enabled: Boolean(bookId) && isAuthenticated,
    staleTime: 60_000,
  });

  const ownedFormatIds = useMemo(
    () => query.data?.ownedFormatIds ?? EMPTY_OWNED_IDS,
    [query.data?.ownedFormatIds]
  );

  return {
    isOwnBook: query.data?.isOwnBook ?? false,
    ownedFormatIds,
    isLoading: isAuthenticated && query.isLoading,
    isFetched: !isAuthenticated || query.isFetched,
  };
}
