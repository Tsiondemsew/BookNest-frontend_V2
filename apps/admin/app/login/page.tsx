'use client';

import { BookOpen, Loader2, Lock, Mail } from 'lucide-react';
import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminThemeToggle } from '@/components/admin-theme-toggle';
import { requestPasswordReset, type ForgotPasswordState } from './forgot-password-action';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginPending, setLoginPending] = useState(false);
  const [resetState, resetAction, resetPending] = useActionState<
    ForgotPasswordState | undefined,
    FormData
  >(requestPasswordReset, undefined);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/admin/me', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        });
        const payload = await response.json();

        if (response.ok && payload.authenticated) {
          router.replace('/dashboard');
          return;
        }

        // Clear stale cookie so middleware does not bounce back to dashboard
        await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
      } catch {
        // not logged in
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [router]);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError(null);
    setLoginPending(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
        credentials: 'include',
        cache: 'no-store',
      });

      const payload = await response.json();

      if (!response.ok || !payload?.authenticated) {
        setLoginError(
          payload?.message ||
            'Invalid email or password. Use your Supabase admin account (role = admin).',
        );
        return;
      }

      // Full page load so the httpOnly cookie is applied before dashboard renders
      window.location.assign('/dashboard');
    } catch {
      setLoginError('Unable to sign in. Check your connection and try again.');
    } finally {
      setLoginPending(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="absolute right-4 top-4">
        <AdminThemeToggle />
      </div>

      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex items-center justify-center gap-2">
            <BookOpen className="h-8 w-8 text-accent" />
            <span className="text-2xl font-bold text-foreground">BookNest</span>
          </div>
          <h1 className="text-xl font-semibold text-foreground">Admin sign in</h1>
          <p className="mt-2 text-sm text-muted">
            Sign in with your admin email and Supabase password.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="admin-email-in-form" className="mb-1 block text-sm font-medium text-foreground">
              Admin email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                id="admin-email-in-form"
                name="email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setLoginError(null);
                }}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition placeholder:text-[var(--placeholder)] focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-foreground">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setLoginError(null);
                }}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition placeholder:text-[var(--placeholder)] focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          {loginError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
              {loginError}
            </div>
          )}

          {resetState?.success && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-300">
              {resetState.success}
            </div>
          )}

          {resetState?.error && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
              {resetState.error}
            </div>
          )}

          <button
            type="submit"
            disabled={loginPending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loginPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                <Lock size={16} />
                Sign in
              </>
            )}
          </button>
        </form>

        <form action={resetAction} className="mt-3 text-center">
          <input type="hidden" name="email" value={email} />
          <button
            type="submit"
            disabled={resetPending || !email.trim()}
            className="text-xs text-accent underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            {resetPending ? 'Sending reset link…' : 'Forgot password?'}
          </button>
        </form>
      </div>
    </div>
  );
}
