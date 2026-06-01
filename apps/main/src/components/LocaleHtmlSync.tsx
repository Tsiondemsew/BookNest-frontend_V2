'use client';

import { useEffect } from 'react';
import { useLocaleStore } from '@/stores/localeStore';
import { LOCALE_META } from '@/i18n';

/** Keeps `<html lang>` in sync with the active locale. */
export function LocaleHtmlSync() {
  const locale = useLocaleStore((s) => s.locale);

  useEffect(() => {
    const meta = LOCALE_META[locale];
    document.documentElement.lang = locale;
    document.documentElement.dir = meta.dir;
  }, [locale]);

  return null;
}
