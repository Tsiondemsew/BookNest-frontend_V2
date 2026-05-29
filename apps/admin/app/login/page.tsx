'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/admin/me', {
          method: 'GET',
          credentials: 'include',
        });
        const payload = await response.json();

        if (response.ok && payload.authenticated) {
          router.replace('/dashboard');
        }
      } catch {
        // not logged in
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const payload = await response.json();

      if (!response.ok || payload?.success === false || !payload?.authenticated) {
        setError(
          payload?.message ||
            payload?.error?.message ||
            'Invalid admin credentials. Please use your admin email and password.',
        );
        return;
      }

      router.replace('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <p className="text-sm text-zinc-600">Checking session…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-10 shadow-xl">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.24em] text-blue-600">Admin Portal</p>
          <h1 className="mt-4 text-3xl font-semibold text-zinc-900">Sign in to Admin</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Use your admin credentials to manage books, users, and reports.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-700">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              className="mt-2 w-full rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
              className="mt-2 w-full rounded-3xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-3xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="mt-8 rounded-3xl border border-zinc-200 bg-zinc-50 p-5 text-sm text-zinc-600">
          <p className="font-medium text-zinc-900">Admin only</p>
          <p className="mt-2">
            Sign in with your BookNest admin account (Supabase user with{' '}
            <span className="font-medium">role = admin</span>). The API must be running on port
            5000.
          </p>
        </div>
      </div>
    </div>
  );
}
