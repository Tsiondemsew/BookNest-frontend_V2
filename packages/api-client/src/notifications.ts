import { ApiClient } from './client';
import { endpoints } from './endpoints';
import type { NotificationsResponse, UnreadCountResponse } from '@repo/types';

export interface PushSubscribePayload {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  timezone_offset_minutes?: number;
}

export function createNotificationsApi(client: ApiClient) {
  const tz = () => -new Date().getTimezoneOffset();

  return {
    list: (params?: { page?: number; limit?: number }) =>
      client.get<{ success: boolean; data: NotificationsResponse }>(endpoints.notifications.list, {
        params,
      }),

    getUnreadCount: () =>
      client.get<{ success: boolean; data: UnreadCountResponse }>(
        endpoints.notifications.unreadCount
      ),

    markAsRead: (id: string) =>
      client.patch<{ success: boolean; data: null }>(endpoints.notifications.markAsRead(id), {}),

    markAllAsRead: () =>
      client.patch<{ success: boolean; data: null }>(endpoints.notifications.markAllAsRead, {}),

    getVapidPublicKey: () =>
      client.get<{ success: boolean; data: { publicKey: string | null } }>(
        endpoints.notifications.vapidPublicKey
      ),
    subscribe: (payload: PushSubscribePayload) =>
      client.post<{ success: boolean; data: { subscribed: boolean } }>(
        endpoints.notifications.subscribe,
        { ...payload, timezone_offset_minutes: payload.timezone_offset_minutes ?? tz() }
      ),
    unsubscribe: (endpoint: string) =>
      client.post<{ success: boolean; data: { unsubscribed: boolean } }>(
        endpoints.notifications.unsubscribe,
        { endpoint }
      ),
  };
}
