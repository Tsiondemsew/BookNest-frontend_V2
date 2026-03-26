import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
import AuthHydrator from '@/components/AuthHydrator';
import ReactQueryProvider from '@/components/ReactQueryProvider';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale)) notFound();

  const messages = (await import(`@/messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider messages={messages}>
      <ReactQueryProvider>
        <AuthHydrator />
        {children}
      </ReactQueryProvider>
    </NextIntlClientProvider>
  );
}
