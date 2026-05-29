'use client';

import { useEffect } from 'react';
import { bootstrapAuth, refreshAuthWhenOnline } from '@/lib/auth/bootstrapAuth';
import { initOfflineSync } from '@/lib/progress/progressService';
import { InstallPrompt } from '@/components/InstallPrompt';
import { AppProviders } from '@/providers/app-providers';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { AuthHashRedirect } from '@/components/AuthHashRedirect';
import { isPublicAppPath } from '@/lib/auth/publicRoutes';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    bootstrapAuth();
    initOfflineSync();

    const handleOnline = () => {
      refreshAuthWhenOnline();
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        refreshAuthWhenOnline();
      }
    };

    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVisibility);
    const handleUnauthorized = () => {
      const path = window.location.pathname;
      if (isPublicAppPath(path) || path === '/login') return;
      window.location.assign(`/login?redirect=${encodeURIComponent(path)}`);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized as EventListener);

    return () => {
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('auth:unauthorized', handleUnauthorized as EventListener);
    };
  }, []);

  return (
    <html lang="en">
      <body>
        <AuthHashRedirect />
        <AppProviders>{children}</AppProviders>
        <OfflineIndicator />
        <InstallPrompt />
      </body>
    </html>
  );
}