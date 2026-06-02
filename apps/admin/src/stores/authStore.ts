'use client';

import { create } from 'zustand';
import type { SessionUser } from '@repo/types';
import { authApi } from '@/lib/api/client';
import { clearSession, getSession, isSessionValid, saveSession } from '@/lib/db/authSession';
import { clearAdminAccessToken, setAdminAccessToken } from '@/lib/auth/adminToken';
import { getFriendlyAuthMessage } from '@/lib/auth/mapAuthError';

type AdminLoginData = {
  user: SessionUser;
  issuedAt: string;
  expiresAt: string;
  rememberMe?: boolean;
  accessToken?: string;
};

interface AdminAuthState {
  user: SessionUser | null;
  isInitializing: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  user: null,
  isInitializing: true,
  isAuthenticated: false,
  error: null,

  login: async (email, password) => {
    set({ error: null });
    try {
      const response = await authApi.adminLogin({
        email,
        password,
        remember_me: true,
      });

      const session = response.data as AdminLoginData;
      if (!session?.user) {
        throw new Error('Invalid response from server');
      }

      if (session.user.role !== 'admin') {
        await authApi.logout();
        await clearSession();
        clearAdminAccessToken();
        return { success: false, error: 'Not an admin account' };
      }

      if (session.accessToken) {
        setAdminAccessToken(session.accessToken);
      }

      await saveSession({
        id: 'current',
        user: session.user,
        issuedAt: session.issuedAt,
        expiresAt: session.expiresAt,
        rememberMe: session.rememberMe ?? true,
      });

      set({
        user: session.user,
        isAuthenticated: true,
        isInitializing: false,
        error: null,
      });

      return { success: true };
    } catch (error: unknown) {
      const message = getFriendlyAuthMessage(error);
      set({ error: message, isAuthenticated: false });
      return { success: false, error: message };
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      clearAdminAccessToken();
      await clearSession();
      set({ user: null, isAuthenticated: false, isInitializing: false, error: null });
    }
  },

  initializeAuth: async () => {
    set({ isInitializing: true });

    try {
      const response = await authApi.me();
      const session = response?.data;

      if (session?.user?.role === 'admin') {
        const existing = await getSession();
        await saveSession({
          id: 'current',
          user: session.user,
          issuedAt: session.issuedAt,
          expiresAt: session.expiresAt,
          rememberMe: existing?.rememberMe ?? true,
        });

        set({
          user: session.user,
          isAuthenticated: true,
          isInitializing: false,
          error: null,
        });
        return;
      }

      await clearSession();
      clearAdminAccessToken();
      set({ user: null, isAuthenticated: false, isInitializing: false });
    } catch {
      const cached = await getSession();
      if (cached?.user?.role === 'admin' && (await isSessionValid())) {
        set({
          user: cached.user,
          isAuthenticated: true,
          isInitializing: false,
        });
        return;
      }

      await clearSession();
      clearAdminAccessToken();
      set({ user: null, isAuthenticated: false, isInitializing: false });
    }
  },
}));
