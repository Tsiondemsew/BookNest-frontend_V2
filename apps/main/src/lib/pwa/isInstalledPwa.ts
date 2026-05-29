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
