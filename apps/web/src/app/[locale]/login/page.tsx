'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { UserRole } from '@repo/types';
import { useLoginMutation } from '@/hooks/auth';
import { useAuthStore } from '@/stores/authStore';

export default function LoginPage() {
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? 'en';

  const user = useAuthStore((s) => s.user);
  const login = useLoginMutation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await login.mutateAsync({
        email,
        password,
        role: UserRole.READER,
      });
      router.replace(`/${locale}/dashboard`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  if (user) {
    // Already logged in
    return (
      <div className="p-6">
        <p className="mb-4">You are already logged in.</p>
        <button
          className="rounded bg-black px-4 py-2 text-white"
          onClick={() => router.replace(`/${locale}/dashboard`)}
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-semibold">Login</h1>

      <form onSubmit={onSubmit} className="flex max-w-sm flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span>Email</span>
          <input
            className="rounded border px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            required
          />
        </label>

        <label className="flex flex-col gap-1">
          <span>Password</span>
          <input
            className="rounded border px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
            required
          />
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          type="submit"
          disabled={login.isPending}
        >
          {login.isPending ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

