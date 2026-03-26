'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '../../services/api/auth';
import { ApiError, UnauthorizedError } from '@repo/api-client';

/**
 * Hydrates auth state once on boot.
 * With HttpOnly cookies, the frontend cannot read the session token,
 * so we validate via `authApi.me()` which sends requests with `credentials: include`.
 */
export default function AuthHydrator() {
  useEffect(() => {
    const run = async () => {
      try {
        const me = await authApi.me();
        useAuthStore.getState().setUser(me.user);
        useAuthStore.getState().setHydrated(true);
      } catch (e) {
        // If session cookie is missing/expired, treat as logged out.
        if (e instanceof UnauthorizedError) {
          useAuthStore.getState().logout();
          useAuthStore.getState().setHydrated(true);
          return;
        }
        // Other API errors: still unblock the UI, but mark as unauthenticated.
        if (e instanceof ApiError) {
          useAuthStore.getState().setUser(null);
          useAuthStore.getState().setHydrated(true);
          return;
        }

        // Unknown error
        useAuthStore.getState().setUser(null);
        useAuthStore.getState().setHydrated(true);
      }
    };

    void run();
  }, []);

  return null;
}

