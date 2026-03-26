'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
}

/**
 * ProtectedRoute - Client-side route protection component
 * 
 * This wraps protected page content and ensures:
 * 1. User is authenticated (has valid session)
 * 2. (Optional) User has required role(s)
 * 3. Redirects to login if not authenticated
 * 
 * Note: Middleware provides the primary protection; this is a fallback.
 */
export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  // Not yet initialized, let AuthProvider handle loading state
  if (!isHydrated) {
    return null;
  }

  // Not authenticated
  if (!user) {
    router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
    return null;
  }

  // Has required role check
  if (requiredRole && !requiredRole.includes(user.role)) {
    router.push('/unauthorized');
    return null;
  }

  return <>{children}</>;
}
