import { initOfflineSync } from '@/lib/progress/progressService';
import { processOfflineQueue } from '@/lib/offline/offlineQueue';
import { queryClient } from '@/lib/offline/queryClientRef';
import { useAuthStore } from '@/stores/authStore';
import { mergeProgressFromServer } from '@/lib/progress/progressService';

/**
 * Central offline bootstrap: progress sync, action queue, library refresh on reconnect.
 */
export function initOffline(): void {
  initOfflineSync();

  const onOnline = () => {
    void processOfflineQueue().then(() => {
      const { user, isAuthenticated } = useAuthStore.getState();
      if (isAuthenticated && user) {
        void mergeProgressFromServer(user.id);
      }
      void queryClient?.invalidateQueries({ queryKey: ['library'] });
      void queryClient?.invalidateQueries({ queryKey: ['gamification', 'me'] });
    });
  };

  window.addEventListener('online', onOnline);

  if (navigator.onLine) {
    window.setTimeout(() => void onOnline(), 3000);
  }
}
