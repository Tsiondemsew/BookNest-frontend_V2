'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@repo/validation';
import { useAuthStore } from '@/stores/authStore';
import { DEFAULT_AUTHENTICATED_HOME } from '@/lib/routes/defaultRoutes';
import { completeAuthContinuation } from '@/lib/auth/pendingAuthAction';
import { Eye, EyeOff, AlertCircle, Loader2, CheckCircle, WifiOff } from 'lucide-react';

const inputClass = (hasError: boolean) =>
  `w-full px-4 py-2.5 border rounded-xl bg-[#FDFBF7]/50 text-[#1A2A3A] placeholder:text-[#4A5568]/60 focus:outline-none focus:ring-2 focus:ring-[#B85C38]/30 focus:border-[#B85C38] disabled:opacity-60 disabled:bg-[#E8E2D9]/30 transition-colors ${
    hasError ? 'border-red-400' : 'border-[#E8E2D9]'
  }`;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || DEFAULT_AUTHENTICATED_HOME;
  const verified = searchParams.get('verified') === '1';
  const passwordReset = searchParams.get('reset') === '1';
  const sessionExpired = searchParams.get('session') === 'expired';
  const offlineParam = searchParams.get('offline') === '1';

  const [showPassword, setShowPassword] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const { login } = useAuthStore();

  useEffect(() => {
    const sync = () => setIsOffline(!navigator.onLine);
    sync();
    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);
    return () => {
      window.removeEventListener('online', sync);
      window.removeEventListener('offline', sync);
    };
  }, []);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember_me: false,
    },
    mode: 'onBlur',
  });

  const onSubmit = async (data: LoginInput) => {
    setGeneralError(null);

    if (!navigator.onLine) {
      setGeneralError(
        sessionExpired
          ? 'Your session has ended. Please connect to the internet to sign in again.'
          : 'You must be online to sign in. If you were signed in before, reopen the installed BookNest app — your session may still work offline.'
      );
      return;
    }

    const result = await login(data.email, data.password, data.remember_me);

    if (result.fieldErrors) {
      for (const [field, message] of Object.entries(result.fieldErrors)) {
        setError(field as keyof LoginInput, { message });
      }
    }

    if (!result.success) {
      setGeneralError(result.error ?? 'Sign in failed. Please try again.');
      return;
    }

    const session = useAuthStore.getState().user;
    if (!session) {
      router.push(redirectTo);
      return;
    }

    await completeAuthContinuation(router, searchParams, session, {
      needsGenreOnboarding: result.needsGenreOnboarding,
    });
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      {verified && (
        <div className="p-4 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-800">
            Your email is verified. Sign in to continue.
          </p>
        </div>
      )}

      {passwordReset && (
        <div className="p-4 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-800">
            Your password was updated. Sign in with your new password.
          </p>
        </div>
      )}

      {(isOffline || offlineParam) && (
        <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-xl flex items-start gap-3">
          <WifiOff className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900">
            <p className="font-medium">You are offline</p>
            {sessionExpired ? (
              <p className="mt-1">
                Your session has ended. Connect to the internet to sign in again.
              </p>
            ) : (
              <p className="mt-1">
                Sign in requires an internet connection. If you still have a valid session, reopen the
                installed BookNest app to read downloaded books offline.
              </p>
            )}
          </div>
        </div>
      )}

      {generalError && (
        <div className="p-4 bg-red-50 border border-red-200/80 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-700">{generalError}</p>
              {generalError.toLowerCase().includes('verify') && (
                <Link
                  href="/resend-verification"
                  className="text-sm text-[#B85C38] hover:text-[#8E735B] font-medium mt-2 inline-block"
                >
                  Resend verification email →
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[#2C3E50] mb-1.5">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          disabled={isSubmitting}
          className={inputClass(!!errors.email)}
          placeholder="you@example.com"
          {...register('email')}
        />
        {errors.email && (
          <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-[#2C3E50] mb-1.5">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            disabled={isSubmitting}
            className={`${inputClass(!!errors.password)} pr-11`}
            placeholder="Enter your password"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A5568] hover:text-[#2C3E50] transition-colors p-0.5"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 pt-1">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            disabled={isSubmitting}
            className="w-4 h-4 rounded border-[#E8E2D9] text-[#B85C38] focus:ring-[#B85C38]/30"
            {...register('remember_me')}
          />
          <span className="text-sm text-[#4A5568]">Remember me</span>
        </label>
        <Link
          href="/forgot-password"
          className="text-sm text-[#B85C38] hover:text-[#8E735B] font-medium transition-colors whitespace-nowrap"
        >
          Forgot password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || isOffline}
        className="w-full py-3 px-4 bg-[#2C3E50] text-white rounded-xl hover:bg-[#1A2A3A] focus:outline-none focus:ring-2 focus:ring-[#B85C38]/40 focus:ring-offset-2 disabled:opacity-50 font-semibold transition-colors shadow-sm"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Signing in...
          </span>
        ) : (
          'Sign in'
        )}
      </button>
    </form>
  );
}
