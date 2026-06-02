'use client';

import { create } from 'zustand';
import type { SessionUser } from '@repo/types';
import { authApi } from '@/lib/api/client';

interface AdminAuthState {
  user: SessionUser | null;
  isInitializing: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  user: null,
  isInitializing: true,
  isAuthenticated: false,
  error: null,

  login: async (email, password) => {
    try {
      const res = await authApi.adminLogin({ email, password, remember_me: true });
      const user = res.data.user;
      if (user.role !== 'admin') {
        await authApi.logout();
        return { success: false, error: 'Not an admin account' };
      }
      set({ user, isAuthenticated: true, error: null });
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      set({ error: message });
      return { success: false, error: message };
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    set({ user: null, isAuthenticated: false });
  },

  fetchMe: async () => {
    try {
      const res = await authApi.me();
      const user = res.data?.user;
      if (!user || user.role !== 'admin') {
        set({ user: null, isAuthenticated: false, isInitializing: false });
        return;
      }
      set({ user, isAuthenticated: true, isInitializing: false, error: null });
    } catch {
      set({ user: null, isAuthenticated: false, isInitializing: false });
    }
  },
}));
