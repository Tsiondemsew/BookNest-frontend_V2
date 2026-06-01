'use client';

import { useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import GuestLayout from './GuestLayout';
import DashboardLayout from './DashboardLayout';
import { resolvePostLoginPath } from '@/lib/auth/postLoginRedirect';
import { DEFAULT_AUTHENTICATED_HOME } from '@/lib/routes/defaultRoutes';
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
  '/community',
  '/library',
  '/dashboard',
  '/cart',
  '/checkout',
  '/wishlist',
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

  const routeMeta = useMemo(() => {
    const isGuestOnlyRoute = GUEST_ONLY_ROUTES.some((route) => pathname?.startsWith(route));
    const isPublicRoute =
      PUBLIC_ROUTE_PREFIXES.some((route) => pathname?.startsWith(route)) ||
      isPublicProfilePath(pathname);
    const isProtectedRoute =
      PROTECTED_ROUTES.some((route) => pathname?.startsWith(route)) &&
      !isPublicProfilePath(pathname);

    return {
      isGuestOnlyRoute,
      isPublicRoute,
      isProtectedRoute,
      showDashboard: Boolean(isAuthenticated && !isGuestOnlyRoute),
    };
  }, [isAuthenticated, pathname]);

  useEffect(() => {
    if (!isInitializing) {
      if (isAuthenticated && routeMeta.isGuestOnlyRoute && user) {
        resolvePostLoginPath(user, DEFAULT_AUTHENTICATED_HOME).then((path) => {
          if (pathname?.startsWith('/onboarding') && path.startsWith('/onboarding')) return;
          router.push(path);
        });
        return;
      }

      if (!isAuthenticated && routeMeta.isProtectedRoute && !routeMeta.isPublicRoute) {
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
    }
  }, [isAuthenticated, isInitializing, isOfflineMode, pathname, routeMeta, router, user]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#2C3E50] border-t-[#B85C38] rounded-full animate-spin"></div>
      </div>
    );
  }

  return routeMeta.showDashboard ? (
    <DashboardLayout user={user}>{children}</DashboardLayout>
  ) : (
    <GuestLayout>{children}</GuestLayout>
  );
}