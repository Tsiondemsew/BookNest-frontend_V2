const DISMISS_KEY = 'booknest:offline-notice-dismissed';

export function isOfflineNoticeDismissed(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(DISMISS_KEY) === '1';
}

export function dismissOfflineNotice(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(DISMISS_KEY, '1');
}

export function clearOfflineNoticeDismiss(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(DISMISS_KEY);
}
