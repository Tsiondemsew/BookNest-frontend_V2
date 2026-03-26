'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { useLoginMutation } from '@/hooks/auth';
import { useAuthStore } from '@/stores/authStore';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? 'en';
  const t = useTranslations();

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
        role: 'reader',
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
        <p className="mb-4">{t('common.loading')}</p>
        <button
          className="rounded bg-black px-4 py-2 text-white"
          onClick={() => router.replace(`/${locale}/dashboard`)}
        >
          {t('nav.discover')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-2">{t('auth.signIn')}</h1>
          <p className="text-gray-600 text-center mb-6">{t('auth.title')}</p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.email')}
              </label>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.password')}
              </label>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="current-password"
                required
              />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <button
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg transition"
              type="submit"
              disabled={login.isPending}
            >
              {login.isPending ? t('common.loading') : t('auth.signIn')}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            {t('auth.noAccount')}{' '}
            <Link href={`/${locale}/register`} className="text-blue-600 hover:underline">
              {t('auth.signUp')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

