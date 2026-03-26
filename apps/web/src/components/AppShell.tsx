'use client';

import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from './LanguageSwitcher';
import Link from 'next/link';
import { ShoppingBag, Users, Bookmark, User, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface AppShellProps {
  children: React.ReactNode;
  currentTab?: 'market' | 'social' | 'library' | 'profile';
}

export function AppShell({ children, currentTab = 'market' }: AppShellProps) {
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? 'en';
  const t = useTranslations();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const navigationItems = [
    { id: 'market', label: t('nav.market'), icon: ShoppingBag, href: `/${locale}/discover` },
    { id: 'social', label: t('nav.community'), icon: Users, href: `/${locale}/social` },
    { id: 'library', label: t('nav.library'), icon: Bookmark, href: `/${locale}/library` },
    { id: 'profile', label: t('nav.profile'), icon: User, href: `/${locale}/profile` },
  ];

  const handleLogout = async () => {
    logout();
    router.replace(`/${locale}/`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 bg-card border-r border-border flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold font-serif-title text-primary">BookNest</h1>
          <p className="text-sm text-muted-foreground mt-1">Literary Hub</p>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border space-y-3">
          <LanguageSwitcher />
          {user?.role === 'admin' && (
            <Link
              href={`/${locale}/admin`}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-foreground hover:bg-muted transition text-sm"
            >
              ⚙️ Admin
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 rounded-lg bg-destructive text-destructive-foreground font-medium hover:opacity-90 transition text-sm"
          >
            {t('nav.logout')}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden bg-card border-b border-border sticky top-0 z-40">
          <div className="flex justify-between items-center p-4">
            <h1 className="text-xl font-bold font-serif-title text-primary">BookNest</h1>
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 hover:bg-muted rounded-lg transition"
            >
              {showMobileMenu ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="border-t border-border bg-card">
              <nav className="px-4 py-4 space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                        isActive
                          ? 'bg-accent text-accent-foreground font-medium'
                          : 'text-foreground hover:bg-muted'
                      }`}
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
                <div className="pt-4 border-t border-border space-y-2">
                  <LanguageSwitcher />
                  {user?.role === 'admin' && (
                    <Link
                      href={`/${locale}/admin`}
                      className="flex items-center gap-3 px-4 py-2 rounded-lg text-foreground hover:bg-muted transition text-sm"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      ⚙️ Admin
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowMobileMenu(false);
                    }}
                    className="w-full px-4 py-2 rounded-lg bg-destructive text-destructive-foreground font-medium hover:opacity-90 transition text-sm"
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              </nav>
            </div>
          )}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden bg-card border-t border-border sticky bottom-0 z-40">
          <div className="flex justify-around">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex-1 flex flex-col items-center justify-center py-3 px-2 text-xs gap-1 transition ${
                    isActive
                      ? 'text-accent font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
