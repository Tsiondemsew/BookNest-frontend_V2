import { create } from 'zustand';
import { authApi } from '@/lib/api/client';
import { getSession, saveSession, clearSession, isSessionValid } from '@/lib/db/authSession';
import type { SessionUser } from '@repo/types';

interface AuthState {
  user: SessionUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isOfflineMode: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  restoreOfflineSession: () => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  isOfflineMode: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login({ email, password });
      const session = response.data;
      
      // ✅ Store only user data, not token
      const storedData = {
        id: 'current',
        user: session.user,
        issuedAt: session.issuedAt,
        expiresAt: session.expiresAt,
      };
      await saveSession(storedData);
      
      set({ 
        user: session.user, 
        isAuthenticated: true,
        isOfflineMode: false,
        isLoading: false 
      });
    } catch (error: any) {
      set({ error: error.message || 'Login failed', isAuthenticated: false, isLoading: false });
      throw error;
    }
  },

  register: async (email, password, displayName) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register({ email, password, display_name: displayName });
      const session = response.data;
      
      const storedData = {
        id: 'current',
        user: session.user,
        issuedAt: session.issuedAt,
        expiresAt: session.expiresAt,
      };
      await saveSession(storedData);
      
      set({ 
        user: session.user, 
        isAuthenticated: true,
        isOfflineMode: false,
        isLoading: false 
      });
    } catch (error: any) {
      set({ error: error.message || 'Registration failed', isAuthenticated: false, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authApi.logout();
      await clearSession();
      set({ user: null, isAuthenticated: false, isOfflineMode: false, error: null, isLoading: false });
    } catch (error: any) {
      console.error('Logout failed:', error);
      set({ isLoading: false });
    }
  },

  fetchMe: async () => {
    if (get().isOfflineMode) return;
    
    set({ isLoading: true });
    try {
      const response = await authApi.me();
      if (response.data) {
        set({ 
          user: response.data.user, 
          isAuthenticated: true,
          isLoading: false 
        });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error: any) {
      if (!navigator.onLine) {
        const restored = await get().restoreOfflineSession();
        if (!restored) {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    }
  },

  restoreOfflineSession: async () => {
    const isValid = await isSessionValid();
    if (isValid) {
      const session = await getSession();
      if (session) {
        set({ 
          user: session.user,
          isAuthenticated: true,
          isOfflineMode: true,
          isLoading: false 
        });
        return true;
      }
    }
    return false;
  },

  clearError: () => set({ error: null }),
}));