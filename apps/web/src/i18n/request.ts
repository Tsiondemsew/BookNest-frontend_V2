import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale } from '@/i18n';

export default getRequestConfig(async ({ locale, requestLocale }) => {
  const resolvedLocale = locale || (await requestLocale) || defaultLocale;

  if (!locales.includes(resolvedLocale)) {
    return {
      locale: defaultLocale,
      locales,
      defaultLocale,
    };
  }

  return {
    locale: resolvedLocale,
    locales,
    defaultLocale,
  };
});
