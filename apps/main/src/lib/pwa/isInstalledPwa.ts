/**
 * True when the app runs as an installed PWA (not a regular browser tab).
 */
export function isInstalledPwa(): boolean {
  if (typeof window === 'undefined') return false;

  const standaloneMq = window.matchMedia('(display-mode: standalone)').matches;
  const iosStandalone =
    typeof (navigator as Navigator & { standalone?: boolean }).standalone === 'boolean' &&
    (navigator as Navigator & { standalone?: boolean }).standalone === true;

  return standaloneMq || iosStandalone;
}

const INSTALLED_KEY = 'booknest:installed';

/** User installed the PWA (standalone session or prior install event). */
export function isAppInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  if (isInstalledPwa()) return true;
  return localStorage.getItem(INSTALLED_KEY) === '1';
}

export function markAppInstalled(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(INSTALLED_KEY, '1');
}
