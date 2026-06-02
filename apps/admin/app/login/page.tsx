'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpenCheck } from 'lucide-react';
import { useAdminAuthStore } from '@/stores/authStore';
import { mainAppUrl } from '@/lib/mainAppUrl';
import { apiConfig } from '@/lib/api/config';
import { AdminButton, AdminCard, AdminInput } from '@/components/ui/AdminUi';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isInitializing } = useAdminAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSessionExpired(new URLSearchParams(window.location.search).get('expired') === '1');
    }
  }, []);

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
    <div className="min-h-dvh flex items-center justify-center bg-[#FDFBF7] px-4">
      <AdminCard className="w-full max-w-md p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#2C3E50]/10 flex items-center justify-center">
            <BookOpenCheck className="w-6 h-6 text-[#B85C38]" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[#1A2A3A]">BookNest Admin</h1>
            <p className="text-sm text-[#4A5568]">Sign in with your admin account.</p>
          </div>
        </div>

        {sessionExpired && !error && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Your session expired. Please sign in again.
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <AdminInput
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <AdminInput
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <AdminButton type="submit" disabled={loading || isInitializing} className="w-full">
            {loading ? 'Signing in…' : 'Sign in'}
          </AdminButton>
          <p className="text-center text-xs text-[#4A5568]">
            Forgot password?{' '}
            <a
              href={`${mainAppUrl}/forgot-password`}
              className="text-[#B85C38] underline hover:text-[#2C3E50]"
              target="_blank"
              rel="noreferrer"
            >
              Reset on the main app
            </a>
          </p>
          {process.env.NODE_ENV === 'development' && (
            <p className="text-center text-[10px] text-[#4A5568]/60 font-mono break-all">
              API: {apiConfig.baseUrl}
            </p>
          )}
        </form>
      </AdminCard>
    </div>
  );
}
