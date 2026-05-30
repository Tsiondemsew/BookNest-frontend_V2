import { ApiClient } from './client';
import { endpoints } from './endpoints';

export interface PushSubscribePayload {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  timezone_offset_minutes?: number;
}

export function createNotificationsApi(client: ApiClient) {
  const tz = () => -new Date().getTimezoneOffset();

  return {
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
