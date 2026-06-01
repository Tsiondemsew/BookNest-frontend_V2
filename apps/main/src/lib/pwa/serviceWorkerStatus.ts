/** True when a service worker controls the page (production PWA build). */
export async function isServiceWorkerActive(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }
  const reg = await navigator.serviceWorker.getRegistration();
  return Boolean(reg?.active);
}
