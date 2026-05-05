'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { booksApi } from '@/lib/api/client';
import { useAuthStore } from '@/stores/authStore';

export const myBooksQueryKeys = {
  all: ['my-books'] as const,
  lists: () => [...myBooksQueryKeys.all, 'list'] as const,
  list: (page?: number, limit?: number) => [...myBooksQueryKeys.lists(), { page, limit }] as const,
};

export function useMyBooks(page: number = 1, limit: number = 20) {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: myBooksQueryKeys.list(page, limit),
    queryFn: () => booksApi.getMyBooks(page, limit),
    select: (response) => response.data,
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });
}

export function useDeleteBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookId: string) => booksApi.deleteBook(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myBooksQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}