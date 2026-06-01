'use client';

import { useCallback, useMemo } from 'react';
import { messages, LOCALE_META, type Locale } from '@/i18n';
import { translate } from '@/i18n/translate';
import { useLocaleStore } from '@/stores/localeStore';

export function useTranslation() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>, fallback?: string) =>
      translate(messages[locale], key, params, fallback),
    [locale]
  );

  const meta = LOCALE_META[locale];

  return useMemo(
    () => ({
      locale,
      setLocale,
      t,
      meta,
      locales: LOCALE_META,
    }),
    [locale, setLocale, t, meta]
  );
}

export type UseTranslationReturn = ReturnType<typeof useTranslation>;
