'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { resolveAuthCallbackTarget } from '@/lib/auth/routeAuthCallback';

/**
 * Single entry for Supabase auth email links (verify + password reset).
 * Backend sets redirectTo to /auth/callback?intent=verify|recovery
 */
export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const search = window.location.search;
    const hash = window.location.hash;
    const target = resolveAuthCallbackTarget(search, hash);
    router.replace(target);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-[#B85C38] animate-spin" />
    </div>
  );
}
