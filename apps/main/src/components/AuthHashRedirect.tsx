'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * Supabase email links sometimes land on Site URL (/) with tokens in the hash.
 * Route recovery → reset password, signup → email verify.
 */
export function AuthHashRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/auth/verify' || pathname === '/reset-password') return;

    const hash = window.location.hash;
    if (!hash || !hash.includes('access_token')) return;

    const hashParams = new URLSearchParams(hash.substring(1));
    const type = hashParams.get('type');

    if (type === 'recovery') {
      router.replace(`/reset-password${hash}`);
      return;
    }

    if (
      type === 'signup' ||
      type === 'email' ||
      type === 'email_change' ||
      type === 'magiclink' ||
      hash.includes('type=signup')
    ) {
      router.replace(`/verify${hash}`);
    }
  }, [pathname, router]);

  return null;
}
