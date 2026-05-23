'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import GuestLayout from './GuestLayout';
import DashboardLayout from './DashboardLayout';

// Routes that should ALWAYS use guest layout (even if logged in)
const GUEST_ONLY_ROUTES = ['/login', '/register', '/onboarding'];

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
  '/@',
];

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoading, isAuthenticated, fetchMe, user } = useAuthStore();
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (!isLoading) {
      // Check if current route is guest-only
      const isGuestOnlyRoute = GUEST_ONLY_ROUTES.some(route => pathname?.startsWith(route));
      
      // Check if current route requires authentication
      const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname?.startsWith(route));
      
      // If on guest-only route and authenticated, redirect to dashboard
      if (isAuthenticated && isGuestOnlyRoute) {
        router.push('/dashboard');
        return;
      }
      
      // If on protected route and not authenticated, redirect to login
      if (!isAuthenticated && isProtectedRoute) {
        router.push(`/login?redirect=${encodeURIComponent(pathname || '/')}`);
        return;
      }
      
      // Show dashboard layout for authenticated users (except on guest-only routes)
      setShowDashboard(isAuthenticated && !isGuestOnlyRoute);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
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