'use client';

import { History, Search } from 'lucide-react';
import { AdminNotificationBell } from './admin-notification-bell';
import { AdminProfileChip } from './admin-profile-chip';

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
  adminSubtitle = 'System Superuser',
}: AdminTopHeaderProps) {
  return (
    <div className="border-b border-zinc-200 bg-white px-8 py-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-6">
        <div className="relative w-full max-w-md">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
            size={18}
          />
          <input
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3 pl-12 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <AdminNotificationBell />
          <button
            type="button"
            className="rounded-xl p-2 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Activity history"
          >
            <History size={20} className="text-zinc-600 dark:text-zinc-400" />
          </button>
          <div className="hidden h-10 w-px bg-zinc-200 dark:bg-zinc-700 sm:block" />
          <AdminProfileChip subtitle={adminSubtitle} className="px-2 py-1" />
        </div>
      </div>
    </div>
  );
}
