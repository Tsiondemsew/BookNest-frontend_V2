'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, Loader2, MessageCircle, UserPlus } from 'lucide-react';
import { notificationsApi } from '@/lib/api/client';
import { getNotificationHref } from '@/lib/notifications/navigation';
import { formatRelativeTime } from '@/features/community/utils/timeFormat';
import type { AppNotification } from '@repo/types';
import { NOTIFICATIONS_UPDATED_EVENT } from '@/lib/notifications/dismissOnView';

function NotificationIcon({ type }: { type: AppNotification['type'] }) {
  if (type === 'message') {
    return <MessageCircle size={16} className="text-[#B85C38]" />;
  }
  if (type === 'follow') {
    return <UserPlus size={16} className="text-[#2C3E50]" />;
  }
  return <Bell size={16} className="text-[#4A5568]" />;
}

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const loadUnreadCount = useCallback(async () => {
    try {
      const response = await notificationsApi.getUnreadCount();
      setUnreadCount(response.data.count);
    } catch {
      /* ignore when offline or table missing */
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await notificationsApi.list({ page: 1, limit: 15, unreadOnly: true });
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.notifications.length);
    } catch {
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUnreadCount();
    const interval = window.setInterval(() => void loadUnreadCount(), 45_000);
    const handleUpdated = () => {
      void loadUnreadCount();
      if (open) void loadNotifications();
    };
    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, handleUpdated);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, handleUpdated);
    };
  }, [loadUnreadCount, loadNotifications, open]);

  useEffect(() => {
    if (!open) return;
    void loadNotifications();
  }, [open, loadNotifications]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const dismissNotification = (notification: AppNotification) => {
    setNotifications((prev) => prev.filter((item) => item.id !== notification.id));
    setUnreadCount((count) => Math.max(0, count - 1));
    void notificationsApi.markAsRead(notification.id).catch(() => {
      void loadUnreadCount();
    });
  };

  const handleNotificationClick = (notification: AppNotification) => {
    const href = getNotificationHref(notification);
    setOpen(false);
    dismissNotification(notification);

    if (href) {
      router.push(href);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications([]);
      setUnreadCount(0);
    } catch {
      /* ignore */
    }
  };

  const renderNotificationItem = (notification: AppNotification) => {
    const href = getNotificationHref(notification);
    const content = (
      <div className="flex gap-3">
        <div className="mt-0.5 flex-shrink-0">
          {notification.actor?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={notification.actor.avatarUrl}
              alt=""
              className="w-9 h-9 rounded-full object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#2C3E50]/10 flex items-center justify-center">
              <NotificationIcon type={notification.type} />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#1A2A3A] truncate">{notification.title}</p>
          <p className="text-sm text-[#4A5568] line-clamp-2 mt-0.5">{notification.body}</p>
          <p className="text-xs text-[#4A5568]/80 mt-1">
            {formatRelativeTime(notification.createdAt)}
          </p>
        </div>
        <span className="w-2 h-2 rounded-full bg-[#B85C38] flex-shrink-0 mt-2" />
      </div>
    );

    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleNotificationClick(notification);
        }}
        className={`block w-full text-left px-4 py-3 hover:bg-[#FDFBF7] transition-colors touch-manipulation active:bg-[#F5F1EB] bg-[#B85C38]/[0.04] ${
          href ? 'cursor-pointer' : 'cursor-default opacity-70'
        }`}
      >
        {content}
      </button>
    );
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((value) => !value);
        }}
        className="relative p-2 rounded-lg text-[#4A5568] hover:bg-[#F5F1EB] hover:text-[#1A2A3A] transition-colors touch-manipulation"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#B85C38] text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[min(92vw,360px)] bg-white border border-[#E8E2D9] rounded-2xl shadow-xl z-[100] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8E2D9]">
            <h2 className="font-semibold text-[#1A2A3A]">Notifications</h2>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void handleMarkAllRead()}
                className="text-xs font-medium text-[#B85C38] hover:underline flex items-center gap-1 touch-manipulation"
              >
                <CheckCheck size={14} />
                Clear all
              </button>
            )}
          </div>

          <div className="max-h-[min(60vh,420px)] overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 size={24} className="animate-spin text-[#B85C38]" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 px-4 text-center text-sm text-[#4A5568]">
                No new notifications.
              </div>
            ) : (
              <ul className="divide-y divide-[#E8E2D9]/70">
                {notifications.map((notification) => (
                  <li key={notification.id}>{renderNotificationItem(notification)}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="px-4 py-2.5 border-t border-[#E8E2D9] bg-[#FDFBF7]">
            <Link
              href="/messages"
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-[#B85C38] hover:underline"
            >
              Open messages
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
