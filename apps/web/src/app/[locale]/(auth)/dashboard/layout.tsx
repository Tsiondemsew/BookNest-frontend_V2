'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { BottomNavigation } from '@/components/BottomNavigation';

/**
 * Dashboard layout with bottom tab navigation
 * Wraps all protected pages with navigation and auth check
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen bg-background">
        {/* Main content area - scrollable */}
        <main className="flex-1 overflow-y-auto pb-20">
          {children}
        </main>

        {/* Bottom navigation - fixed */}
        <BottomNavigation />
      </div>
    </ProtectedRoute>
  );
}
