'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Supabase may still use /auth/verify in redirect URLs — forward to /verify with tokens.
 */
export default function AuthVerifyRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const suffix =
      typeof window !== 'undefined'
        ? window.location.hash || window.location.search
        : '';
    router.replace(`/verify${suffix}`);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-[#B85C38] animate-spin" />
    </div>
  );
}
