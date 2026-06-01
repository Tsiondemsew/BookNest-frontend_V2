'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
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
        className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted transition hover:bg-surface hover:text-foreground"
        aria-label="Admin notifications"
      >
        <Bell size={15} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold text-white">
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
          <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-semibold text-foreground">Notifications</p>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllRead()}
                  className="text-xs font-medium text-accent"
                >
                  Mark all read
                </button>
              )}
            </div>
            <ul className="max-h-80 overflow-y-auto">
              {items.length === 0 && (
                <li className="px-4 py-6 text-center text-sm text-muted">No notifications</li>
              )}
              {items.map((n) => (
                <li
                  key={n.id}
                  className={`border-b border-border px-4 py-3 last:border-0 ${
                    !n.read_at ? 'bg-surface/50' : ''
                  }`}
                >
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  {n.body && <p className="mt-0.5 text-xs text-muted">{n.body}</p>}
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-muted">{formatWhen(n.created_at)}</span>
                    {n.book_id && (
                      <Link
                        href={`/dashboard/books/${n.book_id}`}
                        onClick={() => {
                          if (!n.read_at) markRead(n.id);
                          setOpen(false);
                        }}
                        className="text-xs font-semibold text-accent"
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
