export const bookQueryKeys = {
  all: ['books'] as const,
  lists: () => [...bookQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...bookQueryKeys.lists(), filters] as const,
  details: () => [...bookQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookQueryKeys.details(), id] as const,
  genres: () => [...bookQueryKeys.all, 'genres'] as const,
};