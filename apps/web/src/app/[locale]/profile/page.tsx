'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/authStore';
import { AppShell } from '@/components/AppShell';
import { Flame, BookOpen, User, Settings, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const t = useTranslations();
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? 'en';
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    router.push(`/${locale}/login`);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <AppShell currentTab="profile">
      <div className="bg-background min-h-screen">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-primary to-accent/30 text-white pt-12 pb-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
              {/* Avatar */}
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white/20 border-4 border-white flex items-center justify-center text-4xl font-bold">
                {user.displayName?.charAt(0).toUpperCase()}
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold">{user.displayName}</h1>
                <p className="text-white/80 mt-1">{user.email}</p>
                <p className="text-white/70 text-sm mt-2">Joined March 2024</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
          {/* Reading Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Daily Streak */}
            <div className="bg-white rounded-lg border border-border p-6 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Daily Streak</p>
                  <p className="text-3xl font-bold text-accent mt-2">7 days</p>
                  <p className="text-xs text-muted-foreground mt-2">Keep it up! 🔥</p>
                </div>
                <Flame className="w-12 h-12 text-accent fill-accent opacity-80" />
              </div>
            </div>

            {/* Books Read */}
            <div className="bg-white rounded-lg border border-border p-6 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Books Finished</p>
                  <p className="text-3xl font-bold text-primary mt-2">24</p>
                  <p className="text-xs text-muted-foreground mt-2">This year</p>
                </div>
                <BookOpen className="w-12 h-12 text-primary opacity-80" />
              </div>
            </div>

            {/* Profile Completion */}
            <div className="bg-white rounded-lg border border-border p-6 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Profile</p>
                  <p className="text-3xl font-bold text-success mt-2">100%</p>
                  <p className="text-xs text-muted-foreground mt-2">Complete</p>
                </div>
                <User className="w-12 h-12 text-success opacity-80" />
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {/* Favorite Genres */}
            <div className="bg-white rounded-lg border border-border p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Favorite Genres</h2>
              <div className="flex flex-wrap gap-2">
                {['Fiction', 'Science Fiction', 'Biography', 'Self-Help', 'Mystery'].map((genre) => (
                  <span
                    key={genre}
                    className="px-4 py-2 rounded-full bg-accent/10 text-accent font-medium text-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div className="bg-white rounded-lg border border-border p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">About</h2>
              <p className="text-foreground leading-relaxed">
                A passionate reader and book enthusiast. I love discovering new stories and sharing recommendations with fellow readers. Currently exploring science fiction and biographies.
              </p>
            </div>

            {/* Account Settings */}
            <div className="bg-white rounded-lg border border-border p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Account</h2>
              <div className="space-y-4">
                <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-border hover:bg-muted transition text-left">
                  <span className="font-medium text-foreground">Edit Profile</span>
                  <Settings className="w-5 h-5 text-muted-foreground" />
                </button>
                <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-border hover:bg-muted transition text-left">
                  <span className="font-medium text-foreground">Privacy Settings</span>
                  <Settings className="w-5 h-5 text-muted-foreground" />
                </button>
                <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-border hover:bg-muted transition text-left">
                  <span className="font-medium text-foreground">Notification Preferences</span>
                  <Settings className="w-5 h-5 text-muted-foreground" />
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-destructive/50 hover:bg-destructive/10 transition text-left"
                >
                  <span className="font-medium text-destructive">Sign Out</span>
                  <LogOut className="w-5 h-5 text-destructive" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-foreground text-foreground/50 border-t border-border mt-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm">
            <p>&copy; 2024 BookNest. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </AppShell>
  );
}
