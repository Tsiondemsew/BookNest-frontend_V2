// apps/main/src/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/lib/api/client';
import type { SessionUser } from '@repo/types';

interface AuthState {
  user: SessionUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await authApi.login({ email, password });
          set({ user: response.data.user, isAuthenticated: true });
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (email, password, displayName) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register({ 
            email, 
            password, 
            display_name: displayName 
          });
          // ✅ FIXED: response.data.user instead of response.session.user
          set({ 
            user: response.data.user, 
            isAuthenticated: true 
          });
        } catch (error: any) {
          set({ error: error.message || 'Registration failed', isAuthenticated: false });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authApi.logout();
          set({ user: null, isAuthenticated: false, error: null });
        } catch (error: any) {
          console.error('Logout failed:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      fetchMe: async () => {
        try {
          const response = await authApi.me();
          // ✅ FIXED: response.data instead of response.session
          if (response.data) {
            set({ 
              user: response.data.user, 
              isAuthenticated: true 
            });
          } else {
            set({ user: null, isAuthenticated: false });
          }
        } catch (error) {
          set({ user: null, isAuthenticated: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);