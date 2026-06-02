import { isInstalledPwa } from '@/lib/pwa/isInstalledPwa';

/** Default landing route when opening the installed PWA offline with a valid session. */
export const OFFLINE_HOME_PATH = '/library';

/** Routes that work without network when offline in the installed PWA. */
export const OFFLINE_ALLOWED_PREFIXES = [
  '/library',
  '/reader',
  '/dashboard/reading',
];

export function canUseOfflineSession(): boolean {
  if (isInstalledPwa()) return true;
  if (typeof navigator === 'undefined') return false;
  return 'serviceWorker' in navigator && Boolean(navigator.serviceWorker.controller);
}

export function isOfflineAllowedPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return OFFLINE_ALLOWED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function offlineLoginPath(sessionExpired = false): string {
  const params = new URLSearchParams({ offline: '1' });
  if (sessionExpired) params.set('session', 'expired');
  return `/login?${params.toString()}`;
}
