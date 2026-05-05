'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistApi } from '@/lib/api/client';
import { wishlistQueryKeys } from '../query-keys';
import { useAuthStore } from '@/stores/authStore';

export function useAddToWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookId: string) => {
      console.log('Adding to wishlist, bookId:', bookId); // ✅ Debug log
      const result = await wishlistApi.addToWishlist(bookId);
      console.log('Add to wishlist response:', result); // ✅ Debug log
      return result;
    },
    onSuccess: (_, bookId) => {
      queryClient.invalidateQueries({ queryKey: wishlistQueryKeys.check(bookId) });
      queryClient.invalidateQueries({ queryKey: wishlistQueryKeys.count() });
      queryClient.invalidateQueries({ queryKey: wishlistQueryKeys.lists() });
    },
    onError: (error) => {
      console.error('Add to wishlist error:', error); // ✅ Debug log
    },
  });
}
export function useIsInWishlist(bookId: string) {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: wishlistQueryKeys.check(bookId),
    queryFn: () => wishlistApi.isInWishlist(bookId),
    select: (response) => response.data.isInWishlist,
    enabled: isAuthenticated && !!bookId,
    staleTime: 1 * 60 * 1000,
  });
}


export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookId: string) => wishlistApi.removeFromWishlist(bookId),
    onSuccess: (_, bookId) => {
      queryClient.invalidateQueries({ queryKey: wishlistQueryKeys.check(bookId) });
      queryClient.invalidateQueries({ queryKey: wishlistQueryKeys.count() });
      queryClient.invalidateQueries({ queryKey: wishlistQueryKeys.lists() });
    },
  });
}

export function useToggleWishlist() {
  const addMutation = useAddToWishlist();
  const removeMutation = useRemoveFromWishlist();

  const toggleWishlist = (bookId: string, isInWishlist: boolean) => {
    if (isInWishlist) {
      return removeMutation.mutateAsync(bookId);
    } else {
      return addMutation.mutateAsync(bookId);
    }
  };

  return {
    toggleWishlist,
    isPending: addMutation.isPending || removeMutation.isPending,
  };
}

export function useWishlist(page: number = 1, limit: number = 12) {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: wishlistQueryKeys.list(page, limit),
    queryFn: () => wishlistApi.getWishlist(page, limit),
    select: (response) => response.data,
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });
}
 

export function useWishlistCount() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: wishlistQueryKeys.count(),
    queryFn: () => wishlistApi.getWishlistCount(),
    select: (response) => response.data.count,
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });
}
   