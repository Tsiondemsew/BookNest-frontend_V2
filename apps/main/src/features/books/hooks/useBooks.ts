'use client';

import { useQuery } from '@tanstack/react-query';
import { booksApi, type GetBooksParams } from '@/lib/api/client';
import { bookQueryKeys } from '../query-keys';

export function useBooks(params: GetBooksParams = {}) {
  return useQuery({
    queryKey: bookQueryKeys.list(params as Record<string, unknown>),
    queryFn: () => booksApi.getBooks(params),
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000,
  });
}

export function useBook(id: string) {
  return useQuery({
    queryKey: bookQueryKeys.detail(id),
    queryFn: () => booksApi.getBookById(id),
    select: (response) => response.data,
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useGenres() {
  return useQuery({
    queryKey: bookQueryKeys.genres(),
    queryFn: () => booksApi.getGenres(),
    select: (response) => response.data,
    staleTime: 60 * 60 * 1000, // 1 hour (genres don't change often)
  });
}

export function useLanguages() {
  return useQuery({
    queryKey: ['books', 'languages'],
    queryFn: () => booksApi.getLanguages(),
    select: (response) => response.data,
    staleTime: 60 * 60 * 1000,
  });
}

export function usePersonalizedBooks(limit = 6, enabled = true) {
  return useQuery({
    queryKey: bookQueryKeys.personalized(limit),
    queryFn: () => booksApi.getPersonalizedBooks(limit),
    select: (response) => response.data,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

