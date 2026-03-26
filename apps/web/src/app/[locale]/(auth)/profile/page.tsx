'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

/**
 * Profile page - User account and settings
 */
export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="px-4 py-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Profile</h1>
      </header>

      {/* User info section */}
      <div className="p-6 rounded-lg border border-border mb-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex-shrink-0" />
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-foreground">
              {user?.displayName}
            </h2>
            <p className="text-sm text-foreground/60">{user?.email}</p>
            <span className="inline-block mt-2 text-xs px-3 py-1 rounded-full bg-primary/20 text-primary font-medium">
              {user?.role}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-muted text-center">
            <p className="text-2xl font-bold text-primary">5</p>
            <p className="text-xs text-foreground/60 mt-1">Books Reading</p>
          </div>
          <div className="p-3 rounded-lg bg-muted text-center">
            <p className="text-2xl font-bold text-primary">12</p>
            <p className="text-xs text-foreground/60 mt-1">Finished</p>
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div className="space-y-2 mb-8">
        <button className="w-full px-4 py-3 rounded-lg border border-border hover:bg-muted transition-colors text-left font-medium text-foreground">
          Edit Profile
        </button>
        <button className="w-full px-4 py-3 rounded-lg border border-border hover:bg-muted transition-colors text-left font-medium text-foreground">
          Preferences
        </button>
        <button className="w-full px-4 py-3 rounded-lg border border-border hover:bg-muted transition-colors text-left font-medium text-foreground">
          Downloads
        </button>
        <button className="w-full px-4 py-3 rounded-lg border border-border hover:bg-muted transition-colors text-left font-medium text-foreground">
          Help & Support
        </button>
        <button className="w-full px-4 py-3 rounded-lg border border-border hover:bg-muted transition-colors text-left font-medium text-foreground">
          About
        </button>
      </div>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="w-full px-4 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors font-medium"
        aria-label="Logout from BookNest"
      >
        Logout
      </button>
    </div>
  );
}
