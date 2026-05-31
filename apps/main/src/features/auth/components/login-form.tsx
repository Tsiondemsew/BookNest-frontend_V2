'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@repo/validation';
import { useAuthStore } from '@/stores/authStore';
import { completeAuthContinuation } from '@/lib/auth/pendingAuthAction';
import { Eye, EyeOff, AlertCircle, Loader2, CheckCircle, WifiOff } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
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
    <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
      {verified && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">
            Your email is verified. Sign in to continue.
          </p>
        </div>
      )}

      {passwordReset && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">
            Your password was updated. Sign in with your new password.
          </p>
        </div>
      )}

      {(isOffline || offlineParam) && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
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
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-700">{generalError}</p>
              {generalError.toLowerCase().includes('verify') && (
                <Link
                  href="/resend-verification"
                  className="text-sm text-red-600 hover:text-red-800 font-medium mt-2 inline-block"
                >
                  Resend verification email →
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          disabled={isSubmitting}
          className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="you@example.com"
          {...register('email')}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            disabled={isSubmitting}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 pr-10 ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your password"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle size={14} />
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            disabled={isSubmitting}
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            {...register('remember_me')}
          />
          <span className="text-sm text-gray-600">Keep me signed in for 30 days</span>
        </label>
        <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
          Forgot password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || isOffline}
        className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 font-medium"
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

      <p className="text-center text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-blue-600 hover:underline font-medium">
          Create one for free
        </Link>
      </p>
    </form>
  );
}
