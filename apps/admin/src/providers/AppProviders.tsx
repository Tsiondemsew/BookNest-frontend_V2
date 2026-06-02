'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { bootstrapAuth } from '@/lib/auth/bootstrapAuth';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient());

  useEffect(() => {
    void bootstrapAuth();
  }, []);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
