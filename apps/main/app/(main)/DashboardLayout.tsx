'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BookOpen,
  ChevronLeft,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { canUseOfflineSession, offlineLoginPath } from '@/lib/offline/offlineAccess';
import { isPublicAppPath } from '@/lib/auth/publicRoutes';
import { usePresenceHeartbeat } from '@/hooks/usePresenceHeartbeat';
import { NotificationBell } from '@/components/NotificationBell';
import { MobileBottomNav, mobileBottomNavPaddingClass } from '@/components/MobileBottomNav';
import { HeaderUserSearch } from '@/components/HeaderUserSearch';
import { HeaderAccountMenu } from '@/components/HeaderAccountMenu';
import { NavCountBadge } from '@/components/NavCountBadge';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useCommerceCounts } from '@/hooks/useCommerceCounts';
import { useTranslation } from '@/hooks/useTranslation';
import { getNavGroupsForRole, getPageTitleKey } from '@/i18n/navigation';
import { getDefaultHomeForRole } from '@/lib/routes/defaultRoutes';
import { isNavHrefActive } from '@/lib/navigation/navActive';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: { name?: string; email?: string; role?: string } | null;
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { t } = useTranslation();
  const { cartCount, wishlistCount } = useCommerceCounts();

  usePresenceHeartbeat();

  useEffect(() => {
    if (!isAuthenticated && pathname && !isPublicAppPath(pathname)) {
      const offline = typeof navigator !== 'undefined' && !navigator.onLine;
      if (offline && canUseOfflineSession()) {
        router.push(offlineLoginPath(true));
      } else if (offline) {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}&offline=1`);
      } else {
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
    }
  }, [isAuthenticated, pathname, router]);

  if (!isAuthenticated) {
    return null;
  }

  const userRole =
    user?.role === 'author' ? 'author' : user?.role === 'publisher' ? 'publisher' : 'reader';
  const homeHref = getDefaultHomeForRole(userRole);
  const groups = getNavGroupsForRole(userRole);
  const pageTitle = t(getPageTitleKey(pathname, userRole));

  const navBadgeCount = (href: string) => {
    if (href === '/cart') return cartCount;
    if (href === '/wishlist') return wishlistCount;
    return 0;
  };

  const mainOffset = sidebarCollapsed ? 'lg:ml-[4.5rem]' : 'lg:ml-64';

  return (
    <div className="min-h-dvh bg-[#FDFBF7]">
      <aside
        className={`hidden lg:flex fixed left-0 top-0 z-50 h-dvh flex-col transition-[width] duration-300 border-r border-[#E8E2D9] bg-[#FAF8F5] ${
          sidebarCollapsed ? 'w-[4.5rem]' : 'w-64'
        }`}
      >
        <div
          className={`flex flex-shrink-0 border-b border-[#E8E2D9] bg-white ${
            sidebarCollapsed ? 'justify-center px-2 py-4' : 'justify-between px-4 py-4'
          }`}
        >
          {sidebarCollapsed ? (
            <button
              type="button"
              onClick={() => setSidebarCollapsed(false)}
              className="w-10 h-10 rounded-xl bg-[#2C3E50]/8 flex items-center justify-center hover:bg-[#B85C38]/10 transition-colors"
              title={t('common.expandMenu')}
              aria-label={t('common.expandMenu')}
            >
              <BookOpen className="w-5 h-5 text-[#B85C38]" />
            </button>
          ) : (
            <>
              <Link href={homeHref} className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#2C3E50]/8 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-[#B85C38]" />
                </div>
                <span className="text-lg font-bold text-[#1A2A3A] bn-serif truncate">BookNest</span>
              </Link>
              <button
                type="button"
                onClick={() => setSidebarCollapsed(true)}
                className="p-1.5 rounded-lg text-[#4A5568] hover:bg-[#F5F1EB] hover:text-[#1A2A3A] transition-colors flex-shrink-0"
                aria-label={t('common.collapseSidebar')}
              >
                <ChevronLeft size={18} />
              </button>
            </>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-2.5 py-4 space-y-3 bn-scrollbar">
          {groups.map((group, groupIdx) => (
            <div
              key={groupIdx}
              className={`space-y-0.5 ${!sidebarCollapsed ? 'rounded-xl bg-white/70 border border-[#E8E2D9]/80 p-1.5 shadow-sm' : ''}`}
            >
              {!sidebarCollapsed && group.titleKey && (
                <p className="px-2.5 pt-1 pb-1.5 text-[10px] font-semibold text-[#4A5568]/80 uppercase tracking-widest">
                  {t(group.titleKey)}
                </p>
              )}
              {group.items.map((item) => {
                const label = t(item.labelKey);
                const isActive = isNavHrefActive(pathname, item.href);
                const badgeCount = navBadgeCount(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center ${sidebarCollapsed ? 'justify-center mx-auto w-10 h-10 relative' : 'gap-3 px-2.5 py-2'} rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? sidebarCollapsed
                          ? 'bg-[#2C3E50] text-white shadow-sm'
                          : 'bg-white text-[#1A2A3A] shadow-sm border-l-[3px] border-[#B85C38] pl-2'
                        : 'text-[#4A5568] hover:bg-white/80 hover:text-[#1A2A3A]'
                    }`}
                    title={sidebarCollapsed ? label : undefined}
                  >
                    <span
                      className={`relative flex items-center justify-center flex-shrink-0 ${
                        sidebarCollapsed ? '' : 'w-8 h-8 rounded-lg'
                      } ${!isActive && !sidebarCollapsed ? 'bg-[#F5F1EB] text-[#B85C38]' : ''}`}
                    >
                      <item.icon size={18} className={isActive && !sidebarCollapsed ? 'text-[#B85C38]' : ''} />
                      {sidebarCollapsed && badgeCount > 0 && (
                        <NavCountBadge count={badgeCount} overlay className="-top-0.5 -right-0.5 min-w-[0.875rem] h-[0.875rem] text-[9px] border-white" />
                      )}
                    </span>
                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1 min-w-0 truncate">{label}</span>
                        {badgeCount > 0 && <NavCountBadge count={badgeCount} inline />}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-[#E8E2D9] p-2.5 flex-shrink-0 bg-white/50">
          <LanguageSwitcher variant="sidebar" collapsed={sidebarCollapsed} />
        </div>
      </aside>

      <div className={`flex flex-col min-h-dvh transition-[margin] duration-300 ${mainOffset}`}>
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[#E8E2D9]">
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-3.5">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Link href={homeHref} className="lg:hidden flex items-center gap-2 min-w-0">
                <BookOpen className="w-5 h-5 text-[#B85C38] flex-shrink-0" />
                <span className="font-bold text-[#1A2A3A] bn-serif truncate">BookNest</span>
              </Link>
              <h1 className="hidden lg:block text-lg sm:text-xl font-semibold text-[#1A2A3A] bn-serif truncate">
                {pageTitle}
              </h1>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <div className="lg:hidden">
                <HeaderUserSearch />
              </div>
              {/* <HeaderCommerceIcons /> */}
              <NotificationBell />
              <HeaderAccountMenu user={user} />
            </div>
          </div>
        </header>

        <main
          className={`flex-1 min-h-0 ${
            pathname?.startsWith('/messages')
              ? 'p-0 overflow-hidden flex flex-col'
              : `p-4 sm:p-6 ${mobileBottomNavPaddingClass(pathname)}`
          }`}
        >
          {children}
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
