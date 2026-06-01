'use client';

import { useEffect, type RefObject } from 'react';
import { notificationsApi } from '@/lib/api/client';

export const NOTIFICATIONS_UPDATED_EVENT = 'notifications:updated';

const dismissedPostIds = new Set<string>();

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
  if (!postId || dismissedPostIds.has(postId)) return;
  dismissedPostIds.add(postId);
  void notificationsApi
    .dismissContext({ postId })
    .then(() => emitNotificationsUpdated())
    .catch(() => {
      dismissedPostIds.delete(postId);
    });
}

/** Clear the post notification once the post is visible in the feed. */
export function useDismissPostNotificationWhenSeen(
  postId: string,
  elementRef: RefObject<HTMLElement | null>
) {
  useEffect(() => {
    const el = elementRef.current;
    if (!el || !postId) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          dismissPostNotifications(postId);
          observer.disconnect();
        }
      },
      { threshold: 0.35, rootMargin: '0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [postId, elementRef]);
}
