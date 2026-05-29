import { useAuthStore } from '@/stores/authStore';

/**
 * App boot: restore session from cookie when online, or IndexedDB when offline.
 */
export async function bootstrapAuth(): Promise<void> {
  const { initializeAuth } = useAuthStore.getState();
  await initializeAuth();
}

/**
 * Called when the browser comes back online.
 */
export async function refreshAuthWhenOnline(): Promise<void> {
  const { refreshSession } = useAuthStore.getState();
  await refreshSession();
}
