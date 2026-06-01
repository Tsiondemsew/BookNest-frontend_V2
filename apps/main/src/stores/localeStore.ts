'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, type Locale } from '@/i18n';
import { isLocale } from '@/i18n/translate';

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: DEFAULT_LOCALE,
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: LOCALE_STORAGE_KEY,
      partialize: (state) => ({ locale: state.locale }),
      onRehydrateStorage: () => (state) => {
        if (state && !isLocale(state.locale)) {
          state.locale = DEFAULT_LOCALE;
        }
      },
    }
  )
);
