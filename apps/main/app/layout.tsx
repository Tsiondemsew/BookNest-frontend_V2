'use client';

import { useEffect } from 'react';
import { bootstrapAuth, refreshAuthWhenOnline } from '@/lib/auth/bootstrapAuth';
import { initOffline } from '@/lib/offline/initOffline';
import { flushReadingActivity } from '@/lib/reading/recordActivity';
import { InstallPrompt } from '@/components/InstallPrompt';
import { NotificationNavListener } from '@/components/NotificationNavListener';
import { AppProviders } from '@/providers/app-providers';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { OfflineBootstrapRedirect } from '@/components/OfflineBootstrapRedirect';
import { AuthHashRedirect } from '@/components/AuthHashRedirect';
import { isPublicAppPath } from '@/lib/auth/publicRoutes';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    bootstrapAuth();
    initOffline();
    void flushReadingActivity();

    const handleOnline = () => {
      refreshAuthWhenOnline();
      void flushReadingActivity();
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        refreshAuthWhenOnline();
      }
    };

    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVisibility);
    const handleUnauthorized = () => {
      if (!navigator.onLine) return;
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
        <NotificationNavListener />
        <OfflineBootstrapRedirect />
        <OfflineIndicator />
        <InstallPrompt />
      </body>
    </html>
  );
}