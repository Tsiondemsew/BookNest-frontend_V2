'use client';

import { History, Search } from 'lucide-react';
import { AdminNotificationBell } from './admin-notification-bell';
import { AdminProfileChip } from './admin-profile-chip';
import { AdminThemeToggle } from './admin-theme-toggle';

type AdminTopHeaderProps = {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  adminSubtitle?: string;
};

export function AdminTopHeader({
  searchPlaceholder = 'Search system records...',
  searchValue = '',
  onSearchChange,
  adminSubtitle = 'Admin',
}: AdminTopHeaderProps) {
  return (
    <div className="sticky top-0 z-30 border-b border-border bg-card px-6 py-3">
      <div className="flex items-center justify-between gap-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition placeholder:text-[var(--placeholder)] focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <AdminNotificationBell />
          <AdminThemeToggle />
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-surface"
            aria-label="Activity history"
          >
            <History size={16} className="text-muted" />
          </button>
          <div className="hidden h-6 w-px bg-border sm:block" />
          <AdminProfileChip subtitle={adminSubtitle} className="px-2 py-1" />
        </div>
      </div>
    </div>
  );
}
