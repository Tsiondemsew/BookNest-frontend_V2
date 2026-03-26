'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

/**
 * Home page - Redirects based on auth status
 * Authenticated: /dashboard
 * Unauthenticated: /login
 */
export default function HomePage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    if (isHydrated) {
      router.push(isAuthenticated ? '/dashboard' : '/login');
    }
  }, [isHydrated, isAuthenticated, router]);

  return null;
}
