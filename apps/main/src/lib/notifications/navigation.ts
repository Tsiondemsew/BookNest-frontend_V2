import type { AppNotification } from '@repo/types';

function normalizePath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const url = new URL(trimmed);
      return `${url.pathname}${url.search}${url.hash}`;
    } catch {
      return trimmed;
    }
  }
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

const GENERIC_PATHS = new Set(['/', '/community']);

function isGenericPath(path: string): boolean {
  const base = normalizePath(path).split('?')[0].split('#')[0];
  return GENERIC_PATHS.has(base);
}

function parseChatIdFromUrl(url?: string | null): string | null {
  if (!url) return null;
  const normalized = normalizePath(url);
  const match = normalized.match(/[?&]chat=([^&]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

function actorProfileHref(notification: AppNotification): string | null {
  const actor = notification.actor;
  const slug =
    actor?.username?.replace(/^@/, '').trim().toLowerCase() ||
    actor?.id ||
    (typeof notification.actorId === 'string' ? notification.actorId : null);

  return slug ? `/${encodeURIComponent(slug)}` : null;
}

function messageHref(notification: AppNotification): string {
  const chatId =
    (typeof notification.metadata?.chatId === 'string' && notification.metadata.chatId) ||
    parseChatIdFromUrl(notification.url);

  if (chatId) {
    return `/messages?chat=${encodeURIComponent(chatId)}`;
  }

  const senderId =
    (typeof notification.metadata?.senderId === 'string' && notification.metadata.senderId) ||
    notification.actor?.id ||
    (typeof notification.actorId === 'string' ? notification.actorId : null);

  if (senderId) {
    return `/messages?startUser=${encodeURIComponent(senderId)}`;
  }

  return '/messages';
}

/** Resolve where a notification should navigate when tapped. */
export function getNotificationHref(notification: AppNotification): string | null {
  if (notification.type === 'follow') {
    const profile = actorProfileHref(notification);
    if (profile) return profile;

    const stored = notification.url?.trim();
    if (stored && !isGenericPath(stored)) {
      return normalizePath(stored);
    }

    return null;
  }

  if (notification.type === 'message') {
    return messageHref(notification);
  }

  if (notification.type === 'post') {
    return '/community';
  }

  const stored = notification.url?.trim();
  if (stored) {
    return normalizePath(stored);
  }

  return null;
}
