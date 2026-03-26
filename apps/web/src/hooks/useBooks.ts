'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Book, BookEdition } from '@repo/types';

const BOOKS_QUERY_KEY = ['books'] as const;

interface BooksFilters {
  genre?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * useBooks - Fetch books with optional filters
 * 
 * Query key structure: ['books', { genre, search, page, limit }]
 * Enables automatic cache invalidation per filter combination
 */
export function useBooks(filters?: BooksFilters) {
  const queryKey = [BOOKS_QUERY_KEY, filters].filter(Boolean);

  return useQuery({
    queryKey,
    queryFn: async () => {
      // TODO: Replace with actual backend API call
      // const params = new URLSearchParams(filters);
      // const response = await fetch(`/api/books?${params}`);
      // return response.json();

      // Mock data for now
      return mockBooksData;
    },
  });
}

/**
 * useBook - Fetch single book by ID
 */
export function useBook(bookId: string | null) {
  return useQuery({
    queryKey: ['book', bookId],
    queryFn: async () => {
      if (!bookId) throw new Error('Book ID required');

      // TODO: Replace with actual API
      // const response = await fetch(`/api/books/${bookId}`);
      // return response.json();

      return mockBooksData[0]; // Mock
    },
    enabled: !!bookId,
  });
}

/**
 * useUserBooks - Fetch current user's library
 */
export function useUserBooks() {
  return useQuery({
    queryKey: ['user-books'],
    queryFn: async () => {
      // TODO: Replace with actual API
      // const response = await fetch('/api/user/books');
      // return response.json();

      return mockBooksData; // Mock
    },
  });
}

/**
 * useBookSearch - Search books by query
 */
export function useBookSearch(query: string) {
  return useQuery({
    queryKey: ['books-search', query],
    queryFn: async () => {
      if (!query) return [];

      // TODO: Replace with actual API
      // const response = await fetch(`/api/books/search?q=${encodeURIComponent(query)}`);
      // return response.json();

      return mockBooksData.filter((b) =>
        b.title.toLowerCase().includes(query.toLowerCase())
      );
    },
    enabled: query.length > 0,
  });
}

/**
 * useBuyBook - Mutation for purchasing a book
 */
export function useBuyBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (editionId: string) => {
      // TODO: Replace with actual API
      // const response = await fetch('/api/books/purchase', {
      //   method: 'POST',
      //   body: JSON.stringify({ editionId }),
      // });
      // return response.json();

      return { success: true, transactionId: 'txn-' + Date.now() };
    },
    onSuccess: () => {
      // Invalidate user books cache when purchase succeeds
      queryClient.invalidateQueries({
        queryKey: ['user-books'],
      });
    },
  });
}

/**
 * useAddBookmark - Mutation for bookmarking/saving book
 */
export function useAddBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookId: string) => {
      // TODO: Replace with actual API
      // const response = await fetch('/api/user/bookmarks', {
      //   method: 'POST',
      //   body: JSON.stringify({ bookId }),
      // });
      // return response.json();

      return { success: true, bookId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['user-books'],
      });
    },
  });
}

// Mock data
const mockBooksData: Book[] = [
  {
    bookId: '1',
    title: 'The Great Gatsby',
    description: 'A classic novel of the Jazz Age',
    coverImageUrl: '/placeholder.svg?height=200&width=150',
    publicationDate: new Date('2020-01-01'),
    language: 'en',
    status: 'APPROVED' as const,
    author: {
      id: 'author-1',
      email: 'author@example.com',
      displayName: 'F. Scott Fitzgerald',
      role: 'AUTHOR' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    editions: [
      {
        editionId: 'ed-1',
        format: 'EPUB' as const,
        price: 9.99,
        fileSizeMB: 2.5,
        bookId: '1',
      },
    ],
  },
];
