'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Users,
  Store,
  BookOpen,
  MessageCircle,
  ShoppingCart,
  Heart,
  Library,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useCommerceCounts } from '@/hooks/useCommerceCounts';
import { NavCountBadge } from '@/components/NavCountBadge';

type NavItem = { label: string; href: string; icon: LucideIcon };

type NavGroup = {
  id: string;
  label: string;
  icon: LucideIcon;
  items: NavItem[];
  isActive: (pathname: string | null) => boolean;
};

function buildGroups(role: string | undefined): NavGroup[] {
  const isAuthor = role === 'author';
  const isPublisher = role === 'publisher';

  const marketItems: NavItem[] = isPublisher
    ? [{ label: 'Browse', href: '/market', icon: Store }]
    : [
        { label: 'Browse', href: '/market', icon: Store },
        { label: 'Cart', href: '/cart', icon: ShoppingCart },
        { label: 'Wishlist', href: '/wishlist', icon: Heart },
      ];

  const readingItems: NavItem[] = isAuthor || isPublisher
    ? [{ label: 'My Library', href: '/library', icon: Library }]
    : [
        { label: 'My Library', href: '/library', icon: Library },
        { label: 'Reading Journey', href: '/dashboard/reading', icon: TrendingUp },
      ];

  return [
    {
      id: 'community',
      label: 'Community',
      icon: Users,
      items: [
        { label: 'Feed', href: '/community', icon: Users },
        { label: 'Messages', href: '/messages', icon: MessageCircle },
      ],
      isActive: (p) =>
        !!p && (p === '/community' || p.startsWith('/community/') || p.startsWith('/messages')),
    },
    {
      id: 'market',
      label: 'Market',
      icon: Store,
      items: marketItems,
      isActive: (p) =>
        !!p &&
        (p === '/market' ||
          p.startsWith('/market/') ||
          p === '/cart' ||
          p === '/wishlist'),
    },
    {
      id: 'reading',
      label: 'Reading',
      icon: BookOpen,
      items: readingItems,
      isActive: (p) =>
        !!p &&
        (p === '/library' ||
          p.startsWith('/reader/') ||
          p.startsWith('/dashboard/reading')),
    },
  ];
}

function shouldHideBottomNav(pathname: string | null, chatId: string | null): boolean {
  if (!pathname) return false;
  if (pathname.startsWith('/reader/')) return true;
  if (pathname.startsWith('/checkout')) return true;
  if (pathname === '/community/post') return true;
  if (pathname.startsWith('/messages') && chatId) return true;
  return false;
}

function MobileBottomNavInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const chatId = searchParams.get('chat');
  const { user } = useAuthStore();
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const groups = buildGroups(user?.role);
  const { cartCount, wishlistCount, marketBadgeCount } = useCommerceCounts();

  const itemBadgeCount = (href: string) => {
    if (href === '/cart') return cartCount;
    if (href === '/wishlist') return wishlistCount;
    return 0;
  };

  useEffect(() => {
    setOpenGroupId(null);
  }, [pathname]);

  useEffect(() => {
    if (!openGroupId) return;

    const handleOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenGroupId(null);
      }
    };

    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [openGroupId]);

  const cancelClose = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimerRef.current = setTimeout(() => setOpenGroupId(null), 200);
  }, [cancelClose]);

  const openGroup = groups.find((g) => g.id === openGroupId);

  if (shouldHideBottomNav(pathname, chatId)) {
    return null;
  }

  return (
    <div
      ref={navRef}
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 touch-manipulation"
      onMouseLeave={scheduleClose}
    >
      <div
        className={`absolute bottom-full left-0 right-0 px-3 pb-2 transition-all duration-300 ease-out ${
          openGroup ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
        }`}
        aria-hidden={!openGroup}
        onMouseEnter={cancelClose}
      >
        {openGroup && (
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl border border-[#E8E2D9] shadow-xl shadow-[#1A2A3A]/10 p-2 flex flex-wrap gap-1.5 justify-center">
              {openGroup.items.map((item, index) => {
                const ItemIcon = item.icon;
                const itemActive =
                  pathname === item.href ||
                  (item.href !== '/community' && pathname?.startsWith(item.href + '/'));
                const badge = itemBadgeCount(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpenGroupId(null)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 motion-safe:animate-[navItemIn_0.28s_ease-out_both] ${
                      itemActive
                        ? 'bg-[#2C3E50] text-white shadow-sm'
                        : 'text-[#4A5568] hover:bg-[#F5F1EB] hover:text-[#1A2A3A]'
                    }`}
                    style={{ animationDelay: `${index * 45}ms` }}
                  >
                    <ItemIcon size={17} strokeWidth={2} />
                    {item.label}
                    {badge > 0 && <NavCountBadge count={badge} inline className="ml-0" />}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <nav
        className="bg-white/95 backdrop-blur-md border-t border-[#E8E2D9] safe-area-pb shadow-[0_-4px_20px_rgba(26,42,58,0.06)]"
        aria-label="Main navigation"
      >
        <div className="flex items-stretch justify-around h-16 max-w-lg mx-auto px-2">
          {groups.map((group) => {
            const Icon = group.icon;
            const active = group.isActive(pathname);
            const isOpen = openGroupId === group.id;

            return (
              <button
                key={group.id}
                type="button"
                onMouseEnter={() => {
                  cancelClose();
                  setOpenGroupId(group.id);
                }}
                onClick={() => setOpenGroupId(isOpen ? null : group.id)}
                className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 min-w-0 px-1 transition-colors select-none ${
                  active || isOpen ? 'text-[#B85C38]' : 'text-[#4A5568]'
                }`}
                aria-expanded={isOpen}
                aria-haspopup="true"
              >
                {(active || isOpen) && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#B85C38] rounded-full" />
                )}
                <span className="relative">
                  <Icon
                    size={22}
                    strokeWidth={active || isOpen ? 2.25 : 2}
                    className={`transition-transform duration-200 ${isOpen ? 'scale-110' : ''}`}
                  />
                  {group.id === 'market' && marketBadgeCount > 0 && (
                    <NavCountBadge
                      count={marketBadgeCount}
                      overlay
                      className="-top-1.5 -right-2 min-w-[0.875rem] h-[0.875rem] text-[9px] border-white"
                    />
                  )}
                </span>
                <span
                  className={`text-[10px] truncate max-w-full ${active || isOpen ? 'font-semibold' : 'font-medium'}`}
                >
                  {group.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <style jsx global>{`
        @keyframes navItemIn {
          from {
            opacity: 0;
            transform: translateY(6px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}

export function MobileBottomNav() {
  return (
    <Suspense fallback={null}>
      <MobileBottomNavInner />
    </Suspense>
  );
}

export function mobileBottomNavPaddingClass(pathname: string | null, chatId?: string | null): string {
  if (shouldHideBottomNav(pathname, chatId ?? null)) return '';
  return 'pb-[calc(4rem+env(safe-area-inset-bottom,0px))] lg:pb-0';
}
