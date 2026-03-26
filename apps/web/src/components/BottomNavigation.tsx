'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  ariaLabel: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/discover',
    label: 'Discover',
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
    ariaLabel: 'Discover new books',
  },
  {
    href: '/library',
    label: 'Library',
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747M12 6.253eNotes"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 12a7 7 0 11-14 0 7 7 0 0114 0zm-8-3v6m0 0v2m0-2H9m4 0h-4"
        />
      </svg>
    ),
    ariaLabel: 'Your library',
  },
  {
    href: '/reader',
    label: 'Reader',
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747M12 6.253eNotes"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    ariaLabel: 'Open reader',
  },
  {
    href: '/social',
    label: 'Social',
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM4.318 20H3a2 2 0 01-2-2v-2a6 6 0 0112 0v2a6 6 0 01-12 0z"
        />
      </svg>
    ),
    ariaLabel: 'Community',
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
    ariaLabel: 'Your profile',
  },
];

/**
 * BottomNavigation - Fixed bottom tab navigation
 * Provides access to main app sections: Discover, Library, Reader, Social, Profile
 * Active tab is highlighted and uses proper ARIA attributes for accessibility
 */
export function BottomNavigation() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  // Get active path for highlighting
  const getIsActive = (href: string) => {
    // Remove locale prefix for comparison
    const pathWithoutLocale = pathname.replace(/^\/(en|am)\/?/, '') || '/';
    return pathWithoutLocale.startsWith(href.slice(1));
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-background border-t border-border"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around h-20 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = getIsActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center h-full px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-foreground/60 hover:text-foreground'
              }`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.ariaLabel}
            >
              {item.icon}
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
