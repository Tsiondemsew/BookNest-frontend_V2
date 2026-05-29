'use client';

import { useCallback, useEffect, useState } from 'react';

export interface AdminNotification {
  id: string;
  book_id: string | null;
  notification_type: string;
  title: string;
  body: string | null;
  read_at: string | null;
  created_at: string;
}

export function useAdminNotifications(pollMs = 30000) {
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/notifications?limit=15', {
        credentials: 'include',
      });
      const payload = await res.json();
      if (res.ok && payload.success) {
        setItems(payload.data.items ?? []);
        setUnreadCount(payload.data.unreadCount ?? 0);
      } else if (res.status === 404 || res.status === 500) {
        setItems([]);
        setUnreadCount(0);
      }
    } catch {
      setItems([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    if (!pollMs) return;
    const id = setInterval(fetchNotifications, pollMs);
    return () => clearInterval(id);
  }, [fetchNotifications, pollMs]);

  const markRead = async (id: string) => {
    await fetch(`/api/admin/notifications/${id}/read`, {
      method: 'PATCH',
      credentials: 'include',
    });
    await fetchNotifications();
  };

  const markAllRead = async () => {
    await fetch('/api/admin/notifications/read-all', {
      method: 'PATCH',
      credentials: 'include',
    });
    await fetchNotifications();
  };

  return { items, unreadCount, loading, refetch: fetchNotifications, markRead, markAllRead };
}
