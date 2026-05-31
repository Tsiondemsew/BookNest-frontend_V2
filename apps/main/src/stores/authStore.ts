import { create } from 'zustand';
import { authApi } from '@/lib/api/client';
import { getSession, saveSession, clearSession, isSessionValid } from '@/lib/db/authSession';
import { getAuthFieldErrors, getFriendlyAuthMessage } from '@/lib/auth/mapAuthError';
import type { SessionUser } from '@repo/types';
import { ValidationError } from '@repo/api-client';

interface AuthState {
  user: SessionUser | null;
  /** App boot / fetchMe only — do not use for login/register submit */
  isInitializing: boolean;
  isAuthenticated: boolean;
  isOfflineMode: boolean;
  error: string | null;

  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<{
    success: boolean;
    error?: string;
    fieldErrors?: Record<string, string>;
    needsGenreOnboarding?: boolean;
  }>;
  register: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<{
    success: boolean;
    error?: string;
    fieldErrors?: Record<string, string>;
    message?: string;
    resumed?: boolean;
    verificationEmailPending?: boolean;
  }>;
  logout: () => Promise<void>;
  /** First load only */
  initializeAuth: () => Promise<void>;
  /** After reconnect or focus — keeps UI visible */
  refreshSession: () => Promise<void>;
  restoreOfflineSession: () => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isInitializing: true,
  isAuthenticated: false,
  isOfflineMode: false,
  error: null,

  login: async (email, password, rememberMe = false) => {
    set({ error: null });

    try {
      const response = await authApi.login({
        email,
        password,
        remember_me: rememberMe,
      });

      const session = response.data;
      if (!session?.user) {
        throw new Error('Invalid response from server');
      }

      await saveSession({
        id: 'current',
        user: session.user,
        issuedAt: session.issuedAt,
        expiresAt: session.expiresAt,
        rememberMe: session.rememberMe ?? rememberMe,
      });

      set({
        user: session.user,
        isAuthenticated: true,
        isOfflineMode: false,
        error: null,
      });

      // Show install prompt at most once per login session
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('booknest:installPrompt:seen');
      }

      return {
        success: true,
        needsGenreOnboarding: response.data.needsGenreOnboarding,
      };
    } catch (error: unknown) {
      const friendlyMessage = getFriendlyAuthMessage(error);
      const fieldErrors = getAuthFieldErrors(error);

      set({
        error: friendlyMessage,
        isAuthenticated: false,
      });

      return { success: false, error: friendlyMessage, fieldErrors };
    }
  },

  register: async (email, password, displayName) => {
    set({ error: null });

    try {
      const response = await authApi.register({
        email,
        password,
        display_name: displayName,
      });

      set({ error: null });
      return {
        success: true,
        message: response.message,
        resumed: response.data?.resumed,
        verificationEmailPending: response.data?.verificationEmailPending,
      };
    } catch (error: unknown) {
      let friendlyMessage = getFriendlyAuthMessage(error);
      let fieldErrors = getAuthFieldErrors(error);

      if (error instanceof ValidationError) {
        const lower = friendlyMessage.toLowerCase();
        if (lower.includes('already registered') || lower.includes('sign in instead')) {
          fieldErrors = {
            ...fieldErrors,
            email: 'This email is already registered. Sign in, or use resend verification if you never confirmed.',
          };
        }
        if (lower.includes('display name')) {
          fieldErrors = { ...fieldErrors, displayName: friendlyMessage };
        }
      }

      set({ error: friendlyMessage });
      return { success: false, error: friendlyMessage, fieldErrors };
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // Clear local state even if API fails
    } finally {
      await clearSession();
      set({
        user: null,
        isAuthenticated: false,
        isOfflineMode: false,
        error: null,
      });

      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('booknest:installPrompt:seen');
      }
    }
  },

  initializeAuth: async () => {
    set({ isInitializing: true });

    if (!navigator.onLine) {
      await get().restoreOfflineSession();
      return;
    }

    try {
      const response = await authApi.me();
      const session = response?.data;

      if (session?.user) {
        const existing = await getSession();
        await saveSession({
          id: 'current',
          user: session.user,
          issuedAt: session.issuedAt,
          expiresAt: session.expiresAt,
          rememberMe: existing?.rememberMe,
        });

        set({
          user: session.user,
          isAuthenticated: true,
          isOfflineMode: false,
          isInitializing: false,
          error: null,
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isOfflineMode: false,
          isInitializing: false,
        });
      }
    } catch {
      const restored = await get().restoreOfflineSession();
      if (!restored) {
        set({
          user: null,
          isAuthenticated: false,
          isOfflineMode: false,
          isInitializing: false,
        });
      }
    }
  },

  refreshSession: async () => {
    if (!navigator.onLine) {
      await get().restoreOfflineSession();
      return;
    }

    try {
      const response = await authApi.me();
      const session = response?.data;

      if (session?.user) {
        const existing = await getSession();
        await saveSession({
          id: 'current',
          user: session.user,
          issuedAt: session.issuedAt,
          expiresAt: session.expiresAt,
          rememberMe: existing?.rememberMe,
        });

        set({
          user: session.user,
          isAuthenticated: true,
          isOfflineMode: false,
          error: null,
        });
      } else {
        set({ user: null, isAuthenticated: false, isOfflineMode: false });
      }
    } catch {
      const restored = await get().restoreOfflineSession();
      if (!restored) {
        set({ user: null, isAuthenticated: false, isOfflineMode: false });
      }
    }
  },

  restoreOfflineSession: async () => {
    const valid = await isSessionValid();
    if (!valid) {
      set({ isInitializing: false });
      return false;
    }

    const session = await getSession();
    if (!session?.user) {
      set({ isInitializing: false });
      return false;
    }

    set({
      user: session.user,
      isAuthenticated: true,
      isOfflineMode: true,
      isInitializing: false,
    });
    return true;
  },

  clearError: () => set({ error: null }),
}));
