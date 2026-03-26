'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/Button';
import { FormInput } from '@/components/FormInput';
import { Skeleton } from '@/components/Skeleton';

type ProfileTab = 'profile' | 'settings' | 'preferences' | 'about';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { userStats, updateProfile, isLoading } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProfileTab>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({ displayName, bio });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 py-6 pb-24">
        <Skeleton className="h-32 mb-6 rounded-lg" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 pb-24">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-balance text-foreground">Profile</h1>
      </header>

      {/* User Info Card */}
      <div className="p-6 rounded-lg border border-border bg-card mb-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-primary">
                {user?.displayName?.[0] || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground">{user?.displayName}</h2>
              <p className="text-sm text-foreground/60">{user?.email}</p>
              {user?.bio && <p className="text-sm text-foreground/70 mt-2">{user.bio}</p>}
              <span className="inline-block mt-2 text-xs px-3 py-1 rounded-full bg-primary/20 text-primary font-medium">
                {user?.role || 'Reader'}
              </span>
            </div>
          </div>
          {isEditing && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-muted text-center">
            <p className="text-2xl font-bold text-primary">{userStats?.booksReading || 0}</p>
            <p className="text-xs text-foreground/60 mt-1">Reading</p>
          </div>
          <div className="p-3 rounded-lg bg-muted text-center">
            <p className="text-2xl font-bold text-primary">{userStats?.booksFinished || 0}</p>
            <p className="text-xs text-foreground/60 mt-1">Finished</p>
          </div>
          <div className="p-3 rounded-lg bg-muted text-center">
            <p className="text-2xl font-bold text-primary">{userStats?.reviews || 0}</p>
            <p className="text-xs text-foreground/60 mt-1">Reviews</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border">
        {(['profile', 'settings', 'preferences', 'about'] as ProfileTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-foreground/60 hover:text-foreground'
            }`}
            aria-selected={activeTab === tab}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          ) : (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <FormInput
                label="Display Name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
              <FormInput
                label="Bio"
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
              />
              <div className="flex gap-2">
                <Button type="submit">Save Changes</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border flex items-center justify-between">
            <label className="flex items-center gap-3 flex-1">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-sm font-medium text-foreground">Email Notifications</span>
            </label>
          </div>
          <div className="p-4 rounded-lg border border-border flex items-center justify-between">
            <label className="flex items-center gap-3 flex-1">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-sm font-medium text-foreground">New Book Recommendations</span>
            </label>
          </div>
          <div className="p-4 rounded-lg border border-border flex items-center justify-between">
            <label className="flex items-center gap-3 flex-1">
              <input type="checkbox" className="w-4 h-4" />
              <span className="text-sm font-medium text-foreground">Social Updates</span>
            </label>
          </div>
        </div>
      )}

      {activeTab === 'preferences' && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border">
            <label className="block text-sm font-medium text-foreground mb-2">Theme</label>
            <select className="w-full px-3 py-2 rounded border border-border bg-background text-foreground">
              <option>Light</option>
              <option>Dark</option>
              <option>System</option>
            </select>
          </div>
          <div className="p-4 rounded-lg border border-border">
            <label className="block text-sm font-medium text-foreground mb-2">Language</label>
            <select className="w-full px-3 py-2 rounded border border-border bg-background text-foreground">
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
            </select>
          </div>
          <div className="p-4 rounded-lg border border-border">
            <label className="block text-sm font-medium text-foreground mb-2">Font Size</label>
            <select className="w-full px-3 py-2 rounded border border-border bg-background text-foreground">
              <option>Small</option>
              <option>Medium</option>
              <option>Large</option>
            </select>
          </div>
        </div>
      )}

      {activeTab === 'about' && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border bg-card">
            <h3 className="font-semibold text-foreground mb-2">BookNest</h3>
            <p className="text-sm text-foreground/70 mb-4">
              A modern PWA for discovering, reading, and sharing books with community features.
            </p>
            <div className="space-y-2 text-sm text-foreground/60">
              <p>Version 1.0.0</p>
              <p>Built with Next.js, React, and TypeScript</p>
              <p>© 2026 BookNest. All rights reserved.</p>
            </div>
          </div>
          <Button variant="outline" className="w-full">
            Check for Updates
          </Button>
        </div>
      )}

      {/* Logout Button */}
      <div className="mt-8 pt-8 border-t border-border">
        <Button
          onClick={handleLogout}
          variant="destructive"
          className="w-full"
          aria-label="Logout from BookNest"
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
