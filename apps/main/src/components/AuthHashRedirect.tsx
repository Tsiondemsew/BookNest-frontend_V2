'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { resolveAuthCallbackTarget } from '@/lib/auth/routeAuthCallback';

const AUTH_LANDING_PATHS = new Set([
  '/auth/verify',
  '/verify',
  '/reset-password',
  '/auth/callback',
]);

/**
 * Supabase email links sometimes land on Site URL (/) with tokens in the hash or ?code=.
 * Forward them to reset-password or verify before the app shell loads.
 */
export function AuthHashRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined' || !pathname) return;
    if (AUTH_LANDING_PATHS.has(pathname)) return;

    const search = window.location.search;
    const hash = window.location.hash;

    const hasCode = new URLSearchParams(search).has('code');
    const hasAccessToken = hash.includes('access_token');

    if (!hasCode && !hasAccessToken) return;

    const target = resolveAuthCallbackTarget(search, hash);
    router.replace(target);
  }, [pathname, router]);

  return null;
}
