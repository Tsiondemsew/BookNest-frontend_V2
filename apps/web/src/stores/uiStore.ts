import { create } from 'zustand';

export type UiTheme = 'light' | 'dark' | 'system';

export interface UiState {
  theme: UiTheme;
  navOpen: boolean;
  setTheme: (theme: UiTheme) => void;
  setNavOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  theme: 'system',
  navOpen: false,
  setTheme: (theme) => set({ theme }),
  setNavOpen: (navOpen) => set({ navOpen }),
}));

