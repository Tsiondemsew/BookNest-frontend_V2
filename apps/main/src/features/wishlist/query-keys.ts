export const wishlistQueryKeys = {
  all: ['wishlist'] as const,
  lists: () => [...wishlistQueryKeys.all, 'list'] as const,
  list: (page?: number, limit?: number) => [...wishlistQueryKeys.lists(), { page, limit }] as const,
  details: () => [...wishlistQueryKeys.all, 'detail'] as const,
  detail: (bookId: string) => [...wishlistQueryKeys.details(), bookId] as const,
  check: (bookId: string) => [...wishlistQueryKeys.all, 'check', bookId] as const,
  count: () => [...wishlistQueryKeys.all, 'count'] as const,
};