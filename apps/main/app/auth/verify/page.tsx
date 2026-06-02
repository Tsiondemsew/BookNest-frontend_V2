'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { resolveAuthCallbackTarget } from '@/lib/auth/routeAuthCallback';

/**
 * Supabase may still use /auth/verify in redirect URLs — forward to the correct auth page.
 */
export default function AuthVerifyRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const search = window.location.search;
    const hash = window.location.hash;
    router.replace(resolveAuthCallbackTarget(search, hash));
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-[#B85C38] animate-spin" />
    </div>
  );
}
