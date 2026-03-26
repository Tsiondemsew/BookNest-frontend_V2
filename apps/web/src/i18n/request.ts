import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale } from '@/i18n';

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale)) {
    return {};
  }

  return {
    messages: (await import(`@/messages/${locale}.json`)).default,
  };
});
