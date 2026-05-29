'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { booksApi } from '@/lib/api/client';
import { useAuthStore } from '@/stores/authStore';
import { bookQueryKeys } from '@/features/books/query-keys';

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
    onSuccess: (_data, bookId) => {
      queryClient.setQueriesData(
        { queryKey: myBooksQueryKeys.lists() },
        (old: { books?: { id: string }[]; pagination?: { total: number } } | undefined) => {
          if (!old?.books) return old;
          const books = old.books.filter((b) => b.id !== bookId);
          return {
            ...old,
            books,
            pagination: old.pagination
              ? { ...old.pagination, total: Math.max(0, (old.pagination.total || 1) - 1) }
              : old.pagination,
          };
        }
      );
      queryClient.invalidateQueries({ queryKey: myBooksQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: bookQueryKeys.all });
    },
    onError: () => {
      // Caller handles toast (e.g. MyBooksList)
    },
  });
}

export function useUpdateBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookId, updates }: { bookId: string; updates: any }) => booksApi.updateBook(bookId, updates),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: myBooksQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: bookQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: bookQueryKeys.detail(variables.bookId) });
    },
  });
}