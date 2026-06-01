'use client';

import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/lib/api/client';
import { useAuthStore } from '@/stores/authStore';
import { authQueryKeys } from '@/features/auth/query-keys';

export function useReaderGenrePreferences() {
  const { user, isAuthenticated } = useAuthStore();
  const isReader = isAuthenticated && user?.role === 'reader';

  const query = useQuery({
    queryKey: authQueryKeys.favoriteGenres,
    queryFn: async () => {
      const res = await authApi.getFavoriteGenres();
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: isReader,
    staleTime: 5 * 60 * 1000,
  });

  const count = query.data?.length ?? 0;

  return {
    favoriteGenres: query.data ?? [],
    hasFavoriteGenres: count > 0,
    needsGenrePreferences: isReader && query.isSuccess && count === 0,
    isLoading: isReader && query.isLoading,
    refetch: query.refetch,
  };
}
