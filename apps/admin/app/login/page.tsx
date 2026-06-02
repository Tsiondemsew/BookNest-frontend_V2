'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuthStore } from '@/stores/authStore';
import { mainAppUrl } from '@/lib/mainAppUrl';
import { apiConfig } from '@/lib/api/config';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isInitializing } = useAdminAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isInitializing && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isInitializing, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      router.replace('/dashboard');
    } else {
      setError(result.error ?? 'Login failed');
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-zinc-100 px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm"
      >
        <h1 className="text-2xl font-semibold text-zinc-900">BookNest Admin</h1>
        <p className="mt-1 text-sm text-zinc-500">Sign in with your admin account.</p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm"
          />
          <button
            type="submit"
            disabled={loading || isInitializing}
            className="w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          <p className="text-center text-xs text-zinc-500">
            Forgot password?{' '}
            <a
              href={`${mainAppUrl}/forgot-password`}
              className="text-zinc-700 underline hover:text-zinc-900"
              target="_blank"
              rel="noreferrer"
            >
              Reset on the main app
            </a>
          </p>
          {process.env.NODE_ENV === 'development' && (
            <p className="text-center text-[10px] text-zinc-400 font-mono break-all">
              API: {apiConfig.baseUrl}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
