'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BookOpen,
  Library,
  Users,
  MessageCircle,
  TrendingUp,
  BarChart3,
  Heart,
  ChevronLeft,
  Globe,
  Store,
  ShoppingCart,
  Crown,
  DollarSign,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { canUseOfflineSession, offlineLoginPath } from '@/lib/offline/offlineAccess';
import { isPublicAppPath } from '@/lib/auth/publicRoutes';
import { usePresenceHeartbeat } from '@/hooks/usePresenceHeartbeat';
import { NotificationBell } from '@/components/NotificationBell';
import { MobileBottomNav, mobileBottomNavPaddingClass } from '@/components/MobileBottomNav';
import { HeaderUserSearch } from '@/components/HeaderUserSearch';
import { HeaderAccountMenu } from '@/components/HeaderAccountMenu';
//import { HeaderCommerceIcons } from '@/components/HeaderCommerceIcons';
import { NavCountBadge } from '@/components/NavCountBadge';
import { useCommerceCounts } from '@/hooks/useCommerceCounts';

const navigationGroups = {
  reader: [
    {
      title: 'Community',
      items: [
        { name: 'Community Feed', href: '/community', icon: Users },
        { name: 'Messages', href: '/messages', icon: MessageCircle },
      ],
    },
    {
      title: 'Reading',
      items: [
        { name: 'My Library', href: '/library', icon: Library },
        { name: 'Reading Journey', href: '/dashboard/reading', icon: TrendingUp },
      ],
    },
    {
      title: 'Marketplace',
      items: [
        { name: 'Browse', href: '/market', icon: Store },
        { name: 'Cart', href: '/cart', icon: ShoppingCart },
        { name: 'Wishlist', href: '/wishlist', icon: Heart },
      ],
    },
  ],
  author: [
    {
      title: 'Community',
      items: [
        { name: 'Community Feed', href: '/community', icon: Users },
        { name: 'Messages', href: '/messages', icon: MessageCircle },
      ],
    },
    {
      title: 'Library',
      items: [{ name: 'My Library', href: '/library', icon: Library }],
    },
    {
      title: 'Author Studio',
      items: [
        { name: 'Studio', href: '/studio', icon: Crown },
        { name: 'My Books', href: '/studio/books', icon: BookOpen },
        { name: 'Analytics', href: '/studio/analytics', icon: BarChart3 },
        { name: 'Earnings', href: '/studio/earnings', icon: DollarSign },
      ],
    },
    {
      title: 'Marketplace',
      items: [
        { name: 'Browse', href: '/market', icon: Store },
        { name: 'Cart', href: '/cart', icon: ShoppingCart },
        { name: 'Wishlist', href: '/wishlist', icon: Heart },
      ],
    },
  ],
  publisher: [
    {
      title: 'Community',
      items: [
        { name: 'Community Feed', href: '/community', icon: Users },
        { name: 'Messages', href: '/messages', icon: MessageCircle },
      ],
    },
    {
      title: 'Publisher Studio',
      items: [
        { name: 'Studio', href: '/studio', icon: Crown },
        { name: 'Catalog', href: '/studio/books', icon: Library },
        { name: 'Analytics', href: '/studio/analytics', icon: BarChart3 },
        { name: 'Payouts', href: '/studio/earnings', icon: DollarSign },
      ],
    },
    {
      title: 'Marketplace',
      items: [{ name: 'Browse', href: '/market', icon: Store }],
    },
  ],
};

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: { name?: string; email?: string; role?: string } | null;
}

function getPageTitle(pathname: string | null, userRole: string): string {
  if (pathname === '/market') return 'Marketplace';
  if (pathname === '/library') return 'My Library';
  if (pathname === '/cart') return 'Shopping Cart';
  if (pathname === '/wishlist') return 'Wishlist';
  if (pathname === '/community') return 'Community';
  if (pathname === '/messages') return 'Messages';
  if (pathname === '/profile') return 'Settings';
  if (pathname === '/@me' || pathname === '/me') return 'My Profile';
  if (pathname === '/studio') return 'Studio';
  if (pathname === '/studio/upload') return 'Upload Book';
  if (pathname === '/studio/books') return userRole === 'publisher' ? 'Catalog' : 'My Books';
  if (pathname === '/studio/analytics') return 'Analytics';
  if (pathname === '/studio/earnings') return userRole === 'publisher' ? 'Payouts' : 'Earnings';
  if (pathname?.startsWith('/dashboard/reading')) return 'Reading Journey';
  if (pathname?.startsWith('/reader/')) return 'Reader';
  if (pathname?.startsWith('/checkout')) return 'Checkout';
  return 'BookNest';
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isAuthenticated } = useAuthStore();

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
  const groups = navigationGroups[userRole as keyof typeof navigationGroups] || navigationGroups.reader;
  const pageTitle = getPageTitle(pathname, userRole);
  const { cartCount, wishlistCount } = useCommerceCounts();

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
              title="Expand menu"
              aria-label="Expand menu"
            >
              <BookOpen className="w-5 h-5 text-[#B85C38]" />
            </button>
          ) : (
            <>
              <Link href="/community" className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#2C3E50]/8 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-[#B85C38]" />
                </div>
                <span className="text-lg font-bold text-[#1A2A3A] bn-serif truncate">BookNest</span>
              </Link>
              <button
                type="button"
                onClick={() => setSidebarCollapsed(true)}
                className="p-1.5 rounded-lg text-[#4A5568] hover:bg-[#F5F1EB] hover:text-[#1A2A3A] transition-colors flex-shrink-0"
                aria-label="Collapse sidebar"
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
              {!sidebarCollapsed && group.title && (
                <p className="px-2.5 pt-1 pb-1.5 text-[10px] font-semibold text-[#4A5568]/80 uppercase tracking-widest">
                  {group.title}
                </p>
              )}
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/community' && pathname?.startsWith(item.href + '/'));
                const badgeCount = navBadgeCount(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center ${sidebarCollapsed ? 'justify-center mx-auto w-10 h-10 relative' : 'gap-3 px-2.5 py-2'} rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? sidebarCollapsed
                          ? 'bg-[#2C3E50] text-white shadow-sm'
                          : 'bg-white text-[#1A2A3A] shadow-sm border-l-[3px] border-[#B85C38] pl-2'
                        : 'text-[#4A5568] hover:bg-white/80 hover:text-[#1A2A3A]'
                    }`}
                    title={sidebarCollapsed ? item.name : undefined}
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
                        <span className="flex-1 min-w-0 truncate">{item.name}</span>
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
          <button
            type="button"
            className={`flex items-center ${sidebarCollapsed ? 'justify-center w-full' : 'gap-3'} px-2.5 py-2 w-full rounded-lg text-sm font-medium text-[#4A5568] hover:bg-white transition-colors`}
            title={sidebarCollapsed ? 'Language' : undefined}
          >
            <Globe size={18} className="text-[#B85C38]" />
            {!sidebarCollapsed && (
              <>
                <span>English</span>
                <span className="ml-auto text-xs text-[#4A5568]">EN</span>
              </>
            )}
          </button>
        </div>
      </aside>

      <div className={`flex flex-col min-h-dvh transition-[margin] duration-300 ${mainOffset}`}>
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-[#E8E2D9]">
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-3.5">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Link href="/community" className="lg:hidden flex items-center gap-2 min-w-0">
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

        <main className={`flex-1 p-4 sm:p-6 ${mobileBottomNavPaddingClass(pathname)}`}>
          {children}
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
