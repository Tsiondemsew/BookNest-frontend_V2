'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/api/client';
import { useAuthStore } from '@/stores/authStore';

export const analyticsQueryKeys = {
  all: ['analytics'] as const,
  sales: () => [...analyticsQueryKeys.all, 'sales'] as const,
};

export function useSalesAnalytics() {
  const { user, isAuthenticated } = useAuthStore();
  const isSeller = user?.role === 'author' || user?.role === 'publisher';

  return useQuery({
    queryKey: analyticsQueryKeys.sales(),
    queryFn: () => analyticsApi.getSalesAnalytics(),
    select: (response) => response.data,
    enabled: isAuthenticated && isSeller,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}