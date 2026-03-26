'use client';

import React, { useEffect } from 'react';
import { initializeAuth, useAuthStore } from '@/stores/authStore';

/**
 * AuthProvider - Initialize authentication on app startup
 * 
 * This component:
 * 1. Hydrates auth state from the server's HTTP-only cookie via /api/auth/me
 * 2. Prevents rendering auth-dependent components until hydration is complete
 * 3. Works with next-intl and other providers
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    // Initialize auth on mount (restore session from HTTP-only cookie)
    initializeAuth();
  }, []);

  // Don't render content until auth is initialized
  if (!isHydrated || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="inline-block">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground/20 border-t-foreground" />
          </div>
          <p className="mt-2 text-sm text-foreground/60">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
