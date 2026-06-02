'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { bootstrapAuth } from '@/lib/auth/bootstrapAuth';
import { registerSessionExpiredHandler } from '@/lib/auth/sessionExpired';
import { useAdminAuthStore } from '@/stores/authStore';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient());

  useEffect(() => {
    registerSessionExpiredHandler(() => {
      void useAdminAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        const onLogin = window.location.pathname === '/login';
        if (!onLogin) {
          window.location.replace('/login?expired=1');
        }
      }
    });
    void bootstrapAuth();
  }, []);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
