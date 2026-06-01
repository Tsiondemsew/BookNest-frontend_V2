'use client';

import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Library,
  Users,
  MessageCircle,
  TrendingUp,
  BarChart3,
  Heart,
  Store,
  ShoppingCart,
  Crown,
  DollarSign,
} from 'lucide-react';

export type NavItemConfig = {
  labelKey: string;
  href: string;
  icon: LucideIcon;
};

export type NavGroupConfig = {
  titleKey?: string;
  items: NavItemConfig[];
};

export const readerNavGroups: NavGroupConfig[] = [
  {
    titleKey: 'nav.community',
    items: [
      { labelKey: 'nav.communityFeed', href: '/community', icon: Users },
      { labelKey: 'nav.messages', href: '/messages', icon: MessageCircle },
    ],
  },
  {
    titleKey: 'nav.reading',
    items: [
      { labelKey: 'nav.myLibrary', href: '/library', icon: Library },
      { labelKey: 'nav.readingJourney', href: '/dashboard/reading', icon: TrendingUp },
    ],
  },
  {
    titleKey: 'nav.marketplace',
    items: [
      { labelKey: 'nav.browse', href: '/market', icon: Store },
      { labelKey: 'nav.cart', href: '/cart', icon: ShoppingCart },
      { labelKey: 'nav.wishlist', href: '/wishlist', icon: Heart },
    ],
  },
];

export const authorNavGroups: NavGroupConfig[] = [
  {
    titleKey: 'nav.authorStudio',
    items: [
      { labelKey: 'nav.studio', href: '/studio', icon: Crown },
      { labelKey: 'nav.myBooks', href: '/studio/books', icon: BookOpen },
      { labelKey: 'nav.analytics', href: '/studio/analytics', icon: BarChart3 },
      { labelKey: 'nav.earnings', href: '/studio/earnings', icon: DollarSign },
    ],
  },
  {
    titleKey: 'nav.community',
    items: [
      { labelKey: 'nav.communityFeed', href: '/community', icon: Users },
      { labelKey: 'nav.messages', href: '/messages', icon: MessageCircle },
    ],
  },
  {
    titleKey: 'nav.library',
    items: [{ labelKey: 'nav.myLibrary', href: '/library', icon: Library }],
  },
  {
    titleKey: 'nav.marketplace',
    items: [
      { labelKey: 'nav.browse', href: '/market', icon: Store },
      { labelKey: 'nav.cart', href: '/cart', icon: ShoppingCart },
      { labelKey: 'nav.wishlist', href: '/wishlist', icon: Heart },
    ],
  },
];

export const publisherNavGroups: NavGroupConfig[] = [
  {
    titleKey: 'nav.publisherStudio',
    items: [
      { labelKey: 'nav.studio', href: '/studio', icon: Crown },
      { labelKey: 'nav.catalog', href: '/studio/books', icon: Library },
      { labelKey: 'nav.analytics', href: '/studio/analytics', icon: BarChart3 },
      { labelKey: 'nav.payouts', href: '/studio/earnings', icon: DollarSign },
    ],
  },
  {
    titleKey: 'nav.community',
    items: [
      { labelKey: 'nav.communityFeed', href: '/community', icon: Users },
      { labelKey: 'nav.messages', href: '/messages', icon: MessageCircle },
    ],
  },
];

export function getNavGroupsForRole(role: string | undefined): NavGroupConfig[] {
  if (role === 'author') return authorNavGroups;
  if (role === 'publisher') return publisherNavGroups;
  return readerNavGroups;
}

export function getPageTitleKey(
  pathname: string | null,
  userRole: string
): string {
  if (pathname === '/market') return 'pages.marketplace';
  if (pathname === '/library') return 'pages.myLibrary';
  if (pathname === '/cart') return 'pages.shoppingCart';
  if (pathname === '/wishlist') return 'pages.wishlist';
  if (pathname === '/community') return 'pages.community';
  if (pathname === '/messages') return 'pages.messages';
  if (pathname === '/profile') return 'pages.settings';
  if (pathname === '/@me' || pathname === '/me') return 'pages.myProfile';
  if (pathname === '/studio') return 'nav.studio';
  if (pathname === '/studio/upload') return 'pages.uploadBook';
  if (pathname === '/studio/books') {
    return userRole === 'publisher' ? 'nav.catalog' : 'nav.myBooks';
  }
  if (pathname === '/studio/analytics') return 'nav.analytics';
  if (pathname === '/studio/earnings') {
    return userRole === 'publisher' ? 'nav.payouts' : 'nav.earnings';
  }
  if (pathname?.startsWith('/dashboard/reading')) return 'pages.readingJourney';
  if (pathname?.startsWith('/reader/')) return 'pages.reader';
  if (pathname?.startsWith('/checkout')) return 'pages.checkout';
  return 'pages.bookNest';
}
