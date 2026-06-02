'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api/client';
import { parseAuthTokensFromUrl } from '@/lib/auth/parseAuthTokens';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Confirming your email…');

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const search = window.location.search;
        const intent = new URLSearchParams(search).get('intent');

        const parsed = await parseAuthTokensFromUrl(async (code) => {
          const supabase = getSupabaseClient();
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          return data.session ?? null;
        });

        if (!parsed?.accessToken) {
          throw new Error('Invalid or expired verification link.');
        }

        const isRecovery =
          intent === 'recovery' ||
          parsed.type === 'recovery';

        if (isRecovery) {
          const suffix = window.location.hash || window.location.search;
          router.replace(`/reset-password${suffix}`);
          return;
        }

        await authApi.confirmEmail({ access_token: parsed.accessToken });

        try {
          const supabase = getSupabaseClient();
          await supabase.auth.signOut();
        } catch {
          // App auth uses HTTP-only cookie from Express, not Supabase browser session
        }

        if (cancelled) return;
        setStatus('success');
        setMessage('Your email is verified. Sign in to continue.');

        setTimeout(() => {
          router.replace('/login?verified=1');
        }, 2000);
      } catch (err: unknown) {
        if (cancelled) return;
        setStatus('error');
        setMessage(
          err instanceof Error ? err.message : 'Could not verify your email. Please try again.'
        );
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-[#E8E2D9] p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-10 h-10 text-[#B85C38] animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-bold text-[#1A2A3A]">Verifying your email</h1>
            <p className="text-[#4A5568] text-sm mt-2">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-[#1A2A3A]">Email verified</h1>
            <p className="text-[#4A5568] text-sm mt-2">{message}</p>
            <p className="text-xs text-[#4A5568] mt-4">Redirecting to sign in…</p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-[#1A2A3A]">Verification failed</h1>
            <p className="text-red-700 text-sm mt-2">{message}</p>
            <div className="mt-6 flex flex-col gap-2">
              <Link
                href="/resend-verification"
                className="text-sm text-[#B85C38] hover:underline font-medium"
              >
                Resend verification email
              </Link>
              <Link href="/login" className="text-sm text-[#4A5568] hover:underline">
                Back to sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-[#B85C38] animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
