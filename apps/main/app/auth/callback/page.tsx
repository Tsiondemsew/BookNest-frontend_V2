'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * OAuth / magic-link callback alias — route tokens to verify or reset-password.
 */
export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hash = window.location.hash;
    const search = window.location.search;

    if (hash.includes('type=recovery') || search.includes('type=recovery')) {
      router.replace(`/reset-password${hash || search}`);
      return;
    }

    router.replace(`/verify${hash || search}`);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-[#B85C38] animate-spin" />
    </div>
  );
}
