import { create } from 'zustand';
import type { User } from '@repo/types';

export interface AuthState {
  user: User | null;
  isHydrated: boolean;
  isLoading: boolean;
  error: string | null;
  // Actions
  setUser: (user: User | null) => void;
  setHydrated: (hydrated: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  // This is used by frontend to check if user is authenticated
  // The actual token is in HTTP-only cookie and never exposed to client
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isHydrated: false,
  isLoading: false,
  error: null,

  setUser: (user) => {
    set({ user, error: null });
  },

  setHydrated: (isHydrated) => {
    set({ isHydrated });
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },

  setError: (error) => {
    set({ error });
  },

  logout: () => {
    set({ user: null, isHydrated: false, error: null });
  },

  isAuthenticated: () => {
    return get().user !== null;
  },
}));

/**
 * Initialize auth state from server session (HTTP-only cookie).
 * Called during app hydration to restore user data from backend.
 * The actual token remains in HTTP-only cookie and is never accessible to client JS.
 */
export async function initializeAuth() {
  const store = useAuthStore.getState();
  
  if (store.isHydrated) return;
  
  store.setLoading(true);
  
  try {
    // Call your backend's /api/auth/me endpoint to get current user
    // If no valid session, backend returns 401 and we stay logged out
    const response = await fetch('/api/auth/me', {
      credentials: 'include', // Include HTTP-only cookies
    });

    if (response.ok) {
      const data = await response.json();
      store.setUser(data.user);
    } else if (response.status === 401) {
      // No valid session, user is logged out
      store.setUser(null);
    } else {
      throw new Error('Failed to fetch auth status');
    }
  } catch (error) {
    console.error('[Auth] Failed to initialize:', error);
    store.setError(error instanceof Error ? error.message : 'Failed to initialize auth');
  } finally {
    store.setLoading(false);
    store.setHydrated(true);
  }
}
