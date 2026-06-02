'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  inviteRegistrationFormSchema,
  type InviteRegistrationFormInput,
} from '@repo/validation';
import { authApi } from '@/lib/api/client';
import { getFriendlyAuthMessage } from '@/lib/auth/mapAuthError';
import { parseAuthTokensFromUrl } from '@/lib/auth/parseAuthTokens';
import { getSupabaseClient } from '@/lib/supabase/client';
import { saveSession } from '@/lib/db/authSession';
import { useAuthStore } from '@/stores/authStore';
import { getDefaultHomeForRole } from '@/lib/routes/defaultRoutes';
import { AlertCircle, BookOpen, Building2, Loader2 } from 'lucide-react';

const inputClass = (hasError: boolean) =>
  `w-full px-4 py-2.5 border rounded-xl bg-[#FDFBF7]/50 text-[#1A2A3A] placeholder:text-[#4A5568]/60 focus:outline-none focus:ring-2 focus:ring-[#B85C38]/30 focus:border-[#B85C38] disabled:opacity-60 transition-colors ${
    hasError ? 'border-red-400' : 'border-[#E8E2D9]'
  }`;

export function InviteRegistrationForm() {
  const router = useRouter();
  const [tokens, setTokens] = useState<{
    accessToken: string;
    refreshToken: string | null;
  } | null>(null);
  const [preview, setPreview] = useState<{
    email: string;
    role: 'author' | 'publisher';
    display_name?: string | null;
  } | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isParsingLink, setIsParsingLink] = useState(true);

  const isAuthor = preview?.role === 'author';
  const isPublisher = preview?.role === 'publisher';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InviteRegistrationFormInput>({
    resolver: zodResolver(inviteRegistrationFormSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
      pen_name: '',
      company_name: '',
      full_name: '',
    },
    mode: 'onBlur',
  });

  useEffect(() => {
    let cancelled = false;

    const loadInvite = async () => {
      try {
        const parsed = await parseAuthTokensFromUrl(async (code) => {
          const supabase = getSupabaseClient();
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          return data.session ?? null;
        });

        if (cancelled) return;

        if (!parsed?.accessToken) {
          setLinkError('Invalid or expired invitation link. Ask your admin to send a new invite.');
          return;
        }

        const searchIntent = new URLSearchParams(window.location.search).get('intent');
        const isInviteFlow =
          searchIntent === 'invite' ||
          parsed.type === 'invite' ||
          parsed.type === 'signup';

        if (!isInviteFlow && parsed.type === 'recovery') {
          setLinkError('This is a password reset link, not an invitation.');
          return;
        }

        setTokens({
          accessToken: parsed.accessToken,
          refreshToken: parsed.refreshToken,
        });

        const res = await authApi.invitePreview({
          access_token: parsed.accessToken,
          refresh_token: parsed.refreshToken ?? undefined,
        });

        if (cancelled) return;

        setPreview(res.data);
        setLinkError(null);

        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setLinkError(getFriendlyAuthMessage(err));
        }
      } finally {
        if (!cancelled) setIsParsingLink(false);
      }
    };

    void loadInvite();
    return () => {
      cancelled = true;
    };
  }, []);

  const onSubmit = async (data: InviteRegistrationFormInput) => {
    if (!tokens || !preview) {
      setSubmitError('Invalid invitation link');
      return;
    }

    if (isAuthor && !data.pen_name?.trim()) {
      setSubmitError('Please enter your pen name');
      return;
    }
    if (isPublisher && !data.company_name?.trim()) {
      setSubmitError('Please enter your company name');
      return;
    }

    setSubmitError(null);

    try {
      const response = await authApi.completeInvite({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken ?? undefined,
        password: data.password,
        pen_name: isAuthor ? data.pen_name?.trim() : undefined,
        company_name: isPublisher ? data.company_name?.trim() : undefined,
        full_name: isAuthor ? data.full_name?.trim() || undefined : undefined,
      });

      const session = response.data;
      if (!session?.user) {
        throw new Error('Registration failed. Please try again.');
      }

      await saveSession({
        id: 'current',
        user: session.user,
        issuedAt: session.issuedAt,
        expiresAt: session.expiresAt,
        rememberMe: session.rememberMe ?? false,
      });

      useAuthStore.setState({
        user: session.user,
        isAuthenticated: true,
        isOfflineMode: false,
        error: null,
      });

      try {
        await getSupabaseClient().auth.signOut();
      } catch {
        // BookNest session uses backend cookie
      }

      router.replace(getDefaultHomeForRole(session.user.role));
    } catch (err: unknown) {
      setSubmitError(getFriendlyAuthMessage(err));
    }
  };

  if (isParsingLink) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-10 h-10 text-[#B85C38] animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {(linkError || submitError) && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-700 flex gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {linkError || submitError}
          </p>
        </div>
      )}

      {preview && !linkError && (
        <div className="mb-6 rounded-xl border border-[#E8E2D9] bg-[#FDFBF7] px-4 py-3 text-sm text-[#4A5568]">
          <p>
            Completing registration for{' '}
            <span className="font-medium text-[#1A2A3A]">{preview.email}</span>
          </p>
          <p className="mt-1 flex items-center gap-1.5 capitalize">
            {isAuthor ? (
              <BookOpen size={14} className="text-[#B85C38]" />
            ) : (
              <Building2 size={14} className="text-[#B85C38]" />
            )}
            {preview.role} account
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {isAuthor && (
          <>
            <div>
              <label htmlFor="pen_name" className="block text-sm font-medium text-[#1A2A3A] mb-1">
                Pen name <span className="text-red-500">*</span>
              </label>
              <input
                id="pen_name"
                type="text"
                disabled={!!linkError || isSubmitting}
                placeholder="Jane Author"
                className={inputClass(Boolean(errors.pen_name))}
                {...register('pen_name')}
              />
              {errors.pen_name && (
                <p className="text-red-500 text-xs mt-1">{errors.pen_name.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-[#1A2A3A] mb-1">
                Legal name <span className="text-[#4A5568] font-normal">(optional)</span>
              </label>
              <input
                id="full_name"
                type="text"
                disabled={!!linkError || isSubmitting}
                placeholder="Jane Doe"
                className={inputClass(Boolean(errors.full_name))}
                {...register('full_name')}
              />
            </div>
          </>
        )}

        {isPublisher && (
          <div>
            <label htmlFor="company_name" className="block text-sm font-medium text-[#1A2A3A] mb-1">
              Company name <span className="text-red-500">*</span>
            </label>
            <input
              id="company_name"
              type="text"
              disabled={!!linkError || isSubmitting}
              placeholder="Acme Publishing"
              className={inputClass(Boolean(errors.company_name))}
              {...register('company_name')}
            />
            {errors.company_name && (
              <p className="text-red-500 text-xs mt-1">{errors.company_name.message}</p>
            )}
          </div>
        )}

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[#1A2A3A] mb-1">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            disabled={!!linkError || isSubmitting}
            className={inputClass(Boolean(errors.password))}
            {...register('password')}
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#1A2A3A] mb-1">
            Confirm password <span className="text-red-500">*</span>
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            disabled={!!linkError || isSubmitting}
            className={inputClass(Boolean(errors.confirmPassword))}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={!!linkError || isSubmitting || !tokens}
          className="w-full py-3 bg-[#2C3E50] text-white rounded-xl font-medium hover:bg-[#1A2A3A] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Creating account…
            </>
          ) : (
            'Complete registration'
          )}
        </button>

        <p className="text-center text-sm text-[#4A5568]">
          Already registered?{' '}
          <Link href="/login" className="text-[#B85C38] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
