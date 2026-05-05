'use client';

import { useQuery } from '@tanstack/react-query';
import { sellerApi } from '@/lib/api/client';

export const sellerQueryKeys = {
  all: ['seller'] as const,
  profile: (userId: string) => [...sellerQueryKeys.all, 'profile', userId] as const,
};

export function useSellerProfile(userId: string) {
  return useQuery({
    queryKey: sellerQueryKeys.profile(userId),
    queryFn: () => sellerApi.getSellerProfile(userId),
    select: (response) => response.data,
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });
}