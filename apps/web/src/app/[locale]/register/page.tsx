'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function RegisterPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? 'en';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Simulate register
      const mockUser = {
        id: `user-${Date.now()}`,
        email,
        displayName: displayName || email.split('@')[0],
        role: 'reader' as const,
        bio: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      useAuthStore.getState().setUser(mockUser);
      useAuthStore.getState().setHydrated(true);
      router.push(`/${locale}/dashboard`);
    } catch (err) {
      setError(t('auth.emailTaken'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-2">{t('auth.signUp')}</h1>
          <p className="text-gray-600 text-center mb-6">{t('auth.title')}</p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.name')}
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg transition"
            >
              {loading ? t('common.loading') : t('auth.signUp')}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            {t('auth.haveAccount')}{' '}
            <Link href={`/${locale}/login`} className="text-blue-600 hover:underline">
              {t('auth.signIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
