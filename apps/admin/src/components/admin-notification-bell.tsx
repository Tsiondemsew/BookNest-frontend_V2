'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';

function formatWhen(iso: string) {
  try {
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.round((new Date(iso).getTime() - Date.now()) / 60000),
      'minute',
    );
  } catch {
    return '';
  }
}

export function AdminNotificationBell() {
  const { items, unreadCount, markRead, markAllRead } = useAdminNotifications(20000);
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-full border border-slate-200 bg-white p-2.5 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800"
        aria-label="Admin notifications"
      >
        <span className="text-lg" aria-hidden>
          🔔
        </span>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b px-4 py-3 dark:border-slate-700">
              <p className="text-sm font-semibold dark:text-white">Notifications</p>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllRead()}
                  className="text-xs font-medium text-indigo-600"
                >
                  Mark all read
                </button>
              )}
            </div>
            <ul className="max-h-80 overflow-y-auto">
              {items.length === 0 && (
                <li className="px-4 py-6 text-center text-sm text-slate-500">No notifications</li>
              )}
              {items.map((n) => (
                <li
                  key={n.id}
                  className={`border-b px-4 py-3 last:border-0 dark:border-slate-800 ${
                    !n.read_at ? 'bg-indigo-50/50 dark:bg-indigo-950/30' : ''
                  }`}
                >
                  <p className="text-sm font-medium dark:text-white">{n.title}</p>
                  {n.body && (
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{n.body}</p>
                  )}
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400">{formatWhen(n.created_at)}</span>
                    {n.book_id && (
                      <Link
                        href={`/dashboard/books/${n.book_id}`}
                        onClick={() => {
                          if (!n.read_at) markRead(n.id);
                          setOpen(false);
                        }}
                        className="text-xs font-semibold text-indigo-600"
                      >
                        Review
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
