import { initOfflineSync } from '@/lib/progress/progressService';
import { processOfflineQueue } from '@/lib/offline/offlineQueue';
import { queryClient } from '@/lib/offline/queryClientRef';

/**
 * Central offline bootstrap: progress sync, action queue, library refresh on reconnect.
 */
export function initOffline(): void {
  initOfflineSync();

  const onOnline = () => {
    void processOfflineQueue();
    void queryClient?.invalidateQueries({ queryKey: ['library'] });
  };

  window.addEventListener('online', onOnline);

  if (navigator.onLine) {
    window.setTimeout(() => void processOfflineQueue(), 3000);
  }
}
