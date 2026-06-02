'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordFormSchema } from '@repo/validation';
import { authApi } from '@/lib/api/client';
import { getFriendlyAuthMessage } from '@/lib/auth/mapAuthError';
import { parseAuthTokensFromUrl } from '@/lib/auth/parseAuthTokens';
import { getSupabaseClient } from '@/lib/supabase/client';
import { AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { z } from 'zod';

type ResetFormValues = z.infer<typeof resetPasswordFormSchema>;

function ResetPasswordContent() {
  const router = useRouter();
  const [tokens, setTokens] = useState<{
    accessToken: string;
    refreshToken: string | null;
  } | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [isParsingLink, setIsParsingLink] = useState(true);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onBlur',
  });

  useEffect(() => {
    let cancelled = false;

    const loadTokens = async () => {
      try {
        const parsed = await parseAuthTokensFromUrl(async (code) => {
          const supabase = getSupabaseClient();
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          return data.session ?? null;
        });

        if (cancelled) return;

        if (!parsed?.accessToken) {
          setLinkError('Invalid or expired reset link. Please request a new one.');
          setTokens(null);
        } else if (
          parsed.type === 'signup' ||
          parsed.type === 'email' ||
          parsed.type === 'verify'
        ) {
          setLinkError('This is an email verification link, not a password reset link.');
          setTokens(null);
        } else {
          // recovery, intent=recovery, or PKCE reset links without an explicit type
          setTokens({
            accessToken: parsed.accessToken,
            refreshToken: parsed.refreshToken,
          });
          setLinkError(null);
          if (window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname);
          }
        }
      } catch {
        if (!cancelled) {
          setLinkError('Invalid or expired reset link. Please request a new one.');
        }
      } finally {
        if (!cancelled) setIsParsingLink(false);
      }
    };

    loadTokens();
    return () => {
      cancelled = true;
    };
  }, []);

  const onSubmit = async (data: ResetFormValues) => {
    if (!tokens) {
      setSubmitError('Invalid reset link');
      return;
    }

    setSubmitError(null);
    try {
      await authApi.resetPassword({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken ?? undefined,
        password: data.password,
      });

      try {
        await getSupabaseClient().auth.signOut();
      } catch {
        // ignore
      }

      setSuccess(true);
      setTimeout(() => router.replace('/login?reset=1'), 2500);
    } catch (err: unknown) {
      setSubmitError(getFriendlyAuthMessage(err));
    }
  };

  if (isParsingLink) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#B85C38] animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-[#E8E2D9] p-8 text-center">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#1A2A3A] mb-2">Password updated</h1>
          <p className="text-[#4A5568] mb-6">You can now sign in with your new password.</p>
          <Link
            href="/login?reset=1"
            className="inline-block px-6 py-2 bg-[#2C3E50] text-white rounded-lg hover:bg-[#1A2A3A]"
          >
            Go to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-[#E8E2D9] p-8">
        <h1 className="text-2xl font-bold text-center text-[#1A2A3A] mb-2">Create new password</h1>
        <p className="text-center text-[#4A5568] mb-6 text-sm">
          Choose a strong password for your BookNest account.
        </p>

        {(linkError || submitError) && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 flex gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {linkError || submitError}
            </p>
            {linkError && (
              <Link
                href="/forgot-password"
                className="text-sm text-[#B85C38] hover:underline mt-2 inline-block font-medium"
              >
                Request a new reset link
              </Link>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              New password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              disabled={!!linkError || isSubmitting}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              {...register('password')}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              disabled={!!linkError || isSubmitting}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!!linkError || isSubmitting || !tokens}
            className="w-full py-2.5 bg-[#2C3E50] text-white rounded-lg hover:bg-[#1A2A3A] disabled:opacity-50 font-medium"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating...
              </span>
            ) : (
              'Update password'
            )}
          </button>

          <div className="text-center">
            <Link href="/login" className="text-sm text-[#B85C38] hover:underline">
              Back to sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-[#B85C38] animate-spin" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
