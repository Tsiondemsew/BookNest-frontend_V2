import { create } from 'zustand';
import type { User } from '@repo/types';

export interface AuthState {
  token: string | null;
  user: User | null;
  isHydrated: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setHydrated: (hydrated: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isHydrated: false,

  setToken: (token) => {
    set({ token });
  },

  setUser: (user) => set({ user }),

  setHydrated: (isHydrated) => set({ isHydrated }),

  logout: () => {
    set({ token: null, user: null, isHydrated: false });
  },
}));

export function getAuthToken(): string | null {
  return useAuthStore.getState().token;
};
