import { notificationsApi } from '@/lib/api/client';

export const NOTIFICATIONS_UPDATED_EVENT = 'notifications:updated';

function emitNotificationsUpdated() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_UPDATED_EVENT));
}

export function dismissMessageNotifications(chatId: string) {
  if (!chatId) return;
  void notificationsApi
    .dismissContext({ chatId })
    .then(() => emitNotificationsUpdated())
    .catch(() => {});
}

export function dismissPostNotifications(postId: string) {
  if (!postId) return;
  void notificationsApi
    .dismissContext({ postId })
    .then(() => emitNotificationsUpdated())
    .catch(() => {});
}
