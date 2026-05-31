'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import {
  canUseOfflineSession,
  OFFLINE_HOME_PATH,
  offlineLoginPath,
} from '@/lib/offline/offlineAccess';

/**
 * When the installed PWA opens offline, send users into the app shell:
 * - valid cached session → library (downloaded books)
 * - expired / missing session → login with an offline message
 */
export function OfflineBootstrapRedirect() {
  const pathname = usePathname();
  const router = useRouter();
  const { isInitializing, isAuthenticated, isOfflineMode } = useAuthStore();

  useEffect(() => {
    if (isInitializing || typeof navigator === 'undefined') return;
    if (!canUseOfflineSession() || navigator.onLine) return;

    const onLanding =
      pathname === '/' ||
      pathname === '/offline.html' ||
      pathname === '/login' ||
      pathname === '/register';

    if (isAuthenticated && isOfflineMode && onLanding) {
      router.replace(OFFLINE_HOME_PATH);
      return;
    }

    if (!isAuthenticated && onLanding && pathname !== '/login') {
      router.replace(offlineLoginPath(true));
    }
  }, [isAuthenticated, isInitializing, isOfflineMode, pathname, router]);

  return null;
}
