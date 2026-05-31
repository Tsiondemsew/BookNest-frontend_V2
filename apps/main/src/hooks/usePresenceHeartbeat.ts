'use client';

import { useEffect } from 'react';
import { usersApi } from '@/lib/api/client';
import { useAuthStore } from '@/stores/authStore';

const HEARTBEAT_MS = 45_000;

/** Keeps last_seen_at fresh while the user has the app open (tab visible). */
export function usePresenceHeartbeat() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated || typeof document === 'undefined') return;

    const ping = () => {
      if (document.visibilityState !== 'visible') return;
      void usersApi.updatePresence().catch(() => {});
    };

    ping();
    const interval = window.setInterval(ping, HEARTBEAT_MS);
    document.addEventListener('visibilitychange', ping);
    window.addEventListener('focus', ping);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', ping);
      window.removeEventListener('focus', ping);
    };
  }, [isAuthenticated]);
}
