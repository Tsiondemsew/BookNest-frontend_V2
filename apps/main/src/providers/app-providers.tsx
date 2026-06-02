'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect, useState } from 'react';
import { DialogProvider, ToastProvider } from '@/components/feedback';
import { LocaleHtmlSync } from '@/components/LocaleHtmlSync';
import { registerQueryClient } from '@/lib/offline/queryClientRef';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: (failureCount) => {
              if (typeof navigator !== 'undefined' && !navigator.onLine) return false;
              return failureCount < 1;
            },
            refetchOnWindowFocus: () =>
              typeof navigator !== 'undefined' ? navigator.onLine : true,
            refetchOnReconnect: true,
            networkMode: 'offlineFirst',
          },
        },
      })
  );

  useEffect(() => {
    registerQueryClient(queryClient);
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <DialogProvider>
          <LocaleHtmlSync />
          {children}
          {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
        </DialogProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}