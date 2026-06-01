'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, Loader2, MessageCircle, UserPlus, X } from 'lucide-react';
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
  const panelRef = useRef<HTMLDivElement>(null);

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

  const closePanel = useCallback(() => setOpen(false), []);

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
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePanel();
    };
    document.addEventListener('keydown', onKeyDown);

    const isMobile = window.matchMedia('(max-width: 639px)').matches;
    if (isMobile) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
        document.removeEventListener('keydown', onKeyDown);
      };
    }

    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, closePanel]);

  useEffect(() => {
    if (!open) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      closePanel();
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [open, closePanel]);

  const dismissNotification = (notification: AppNotification) => {
    setNotifications((prev) => prev.filter((item) => item.id !== notification.id));
    setUnreadCount((count) => Math.max(0, count - 1));
    void notificationsApi.markAsRead(notification.id).catch(() => {
      void loadUnreadCount();
    });
  };

  const handleNotificationClick = (notification: AppNotification) => {
    const href = getNotificationHref(notification);
    closePanel();
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
      <div className="flex gap-3 items-start">
        <div className="mt-0.5 flex-shrink-0">
          {notification.actor?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={notification.actor.avatarUrl}
              alt=""
              className="w-10 h-10 sm:w-9 sm:h-9 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-[#2C3E50]/10 flex items-center justify-center">
              <NotificationIcon type={notification.type} />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#1A2A3A] line-clamp-2 sm:truncate">
            {notification.title}
          </p>
          <p className="text-sm text-[#4A5568] line-clamp-3 sm:line-clamp-2 mt-0.5">
            {notification.body}
          </p>
          <p className="text-xs text-[#4A5568]/80 mt-1">
            {formatRelativeTime(notification.createdAt)}
          </p>
        </div>
        <span className="w-2.5 h-2.5 rounded-full bg-[#B85C38] flex-shrink-0 mt-2" aria-hidden />
      </div>
    );

    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleNotificationClick(notification);
        }}
        className={`block w-full text-left px-4 py-3.5 sm:py-3 hover:bg-[#FDFBF7] transition-colors touch-manipulation active:bg-[#F5F1EB] bg-[#B85C38]/[0.04] min-h-[72px] sm:min-h-0 ${
          href ? 'cursor-pointer' : 'cursor-default opacity-70'
        }`}
      >
        {content}
      </button>
    );
  };

  const panel = open ? (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="notifications-panel-title"
          className="
            z-[100] bg-white border border-[#E8E2D9] shadow-xl overflow-hidden flex flex-col
            fixed inset-x-0 bottom-0 max-h-[min(88dvh,640px)] rounded-t-2xl
            pb-[env(safe-area-inset-bottom)]
            sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-full sm:mt-2
            sm:w-[min(calc(100vw-1rem),360px)] sm:max-h-[min(60vh,420px)] sm:rounded-2xl sm:pb-0
            animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-top-2 duration-200
          "
        >
          <div className="flex sm:hidden justify-center pt-2 pb-1 shrink-0" aria-hidden>
            <span className="w-10 h-1 rounded-full bg-[#E8E2D9]" />
          </div>

          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-[#E8E2D9] shrink-0">
            <h2 id="notifications-panel-title" className="font-semibold text-[#1A2A3A] text-base">
              Notifications
              {unreadCount > 0 ? (
                <span className="ml-2 text-xs font-normal text-[#4A5568]">({unreadCount})</span>
              ) : null}
            </h2>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => void handleMarkAllRead()}
                  className="text-xs font-medium text-[#B85C38] hover:underline flex items-center gap-1 touch-manipulation px-2 py-1.5 rounded-lg"
                >
                  <CheckCheck size={14} />
                  Clear all
                </button>
              )}
              <button
                type="button"
                onClick={closePanel}
                className="p-2 rounded-lg text-[#4A5568] hover:bg-[#F5F1EB] touch-manipulation sm:hidden"
                aria-label="Close notifications"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
            {isLoading ? (
              <div className="flex justify-center py-12 sm:py-10">
                <Loader2 size={24} className="animate-spin text-[#B85C38]" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 sm:py-10 px-4 text-center text-sm text-[#4A5568]">
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

          <div className="px-4 py-3 border-t border-[#E8E2D9] bg-[#FDFBF7] shrink-0">
            <Link
              href="/messages"
              onClick={closePanel}
              className="inline-flex items-center justify-center w-full sm:w-auto min-h-[44px] sm:min-h-0 text-sm font-medium text-[#B85C38] hover:underline touch-manipulation"
            >
              Open messages
            </Link>
          </div>
        </div>
  ) : null;

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((value) => !value);
        }}
        className="relative p-2 rounded-lg text-[#4A5568] hover:bg-[#F5F1EB] hover:text-[#1A2A3A] transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#B85C38] text-white text-[10px] font-bold flex items-center justify-center pointer-events-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <button
          type="button"
          aria-label="Close notifications"
          className="fixed inset-0 z-[99] bg-black/40 sm:hidden animate-in fade-in duration-200"
          onClick={closePanel}
        />
      )}

      {panel}
    </div>
  );
}
