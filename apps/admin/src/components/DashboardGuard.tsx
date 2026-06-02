'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuthStore } from '@/stores/authStore';
import { AdminShell } from '@/components/AdminShell';

export function DashboardGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isInitializing, fetchMe } = useAdminAuthStore();

  useEffect(() => {
    void fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isInitializing, router]);

  if (isInitializing) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-zinc-100">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <AdminShell>{children}</AdminShell>;
}
