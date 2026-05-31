'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import GuestLayout from './GuestLayout';
import DashboardLayout from './DashboardLayout';
import { resolvePostLoginPath } from '@/lib/auth/postLoginRedirect';
import {
  canUseOfflineSession,
  offlineLoginPath,
} from '@/lib/offline/offlineAccess';

// Routes that should ALWAYS use guest layout (even if logged in)
const GUEST_ONLY_ROUTES = ['/login', '/register', '/onboarding'];

/** Public app routes (no login required) */
const PUBLIC_ROUTE_PREFIXES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/auth',
  '/resend-verification',
  '/market',
  '/checkout/result',
];

function isPublicProfilePath(pathname: string | null | undefined): boolean {
  if (!pathname?.startsWith('/@') || pathname.length <= 2) return false;
  return true;
}

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/library', 
  '/cart',
  '/checkout',
  '/wishlist',
  '/community',
  '/messages',
  '/profile',
  '/studio',
];

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isInitializing, isAuthenticated, isOfflineMode, user } = useAuthStore();
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    if (!isInitializing) {
      const isGuestOnlyRoute = GUEST_ONLY_ROUTES.some((route) => pathname?.startsWith(route));
      const isPublicRoute =
        PUBLIC_ROUTE_PREFIXES.some((route) => pathname?.startsWith(route)) ||
        isPublicProfilePath(pathname);
      const isProtectedRoute =
        PROTECTED_ROUTES.some((route) => pathname?.startsWith(route)) &&
        !isPublicProfilePath(pathname);

      if (isAuthenticated && isGuestOnlyRoute && user) {
        resolvePostLoginPath(user, '/dashboard').then((path) => {
          if (pathname?.startsWith('/onboarding') && path.startsWith('/onboarding')) return;
          router.push(path);
        });
        return;
      }

      if (!isAuthenticated && isProtectedRoute && !isPublicRoute) {
        const offline = typeof navigator !== 'undefined' && !navigator.onLine;
        if (offline && canUseOfflineSession()) {
          router.push(offlineLoginPath(true));
        } else if (offline) {
          router.push(`/login?redirect=${encodeURIComponent(pathname || '/')}&offline=1`);
        } else {
          router.push(`/login?redirect=${encodeURIComponent(pathname || '/')}`);
        }
        return;
      }

      setShowDashboard(isAuthenticated && !isGuestOnlyRoute);
    }
  }, [isAuthenticated, isInitializing, isOfflineMode, pathname, router, user]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#2C3E50] border-t-[#B85C38] rounded-full animate-spin"></div>
      </div>
    );
  }

  // Use DashboardLayout for authenticated users
  if (showDashboard) {
    return <DashboardLayout user={user}>{children}</DashboardLayout>;
  }

  // Use GuestLayout for non-authenticated users
  return <GuestLayout>{children}</GuestLayout>;
}