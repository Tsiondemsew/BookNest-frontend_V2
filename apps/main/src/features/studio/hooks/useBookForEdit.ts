'use client';

import { useQuery } from '@tanstack/react-query';
import { booksApi } from '@/lib/api/client';
import type { Book } from '@repo/types';

export function useBookForEdit(bookId: string | undefined) {
  return useQuery({
    queryKey: ['book-edit', bookId],
    queryFn: async () => {
      const response = await booksApi.getBookForEdit(bookId!);
      return response.data as Book;
    },
    enabled: !!bookId,
  });
}
