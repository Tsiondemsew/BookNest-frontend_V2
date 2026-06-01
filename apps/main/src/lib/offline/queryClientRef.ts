import type { QueryClient } from '@tanstack/react-query';

/** Set from AppProviders so offline reconnect can invalidate queries. */
export let queryClient: QueryClient | null = null;

export function registerQueryClient(client: QueryClient) {
  queryClient = client;
}
