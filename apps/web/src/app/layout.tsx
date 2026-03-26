import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { OfflineNotification } from '@/components/OfflineNotification';
import '@/styles/globals.css';

export const metadata = {
  title: 'BookNest - Discover & Share Stories',
  description: 'A modern PWA for discovering, reading, and sharing books with community features.',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: '#000000',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <QueryProvider>
            <AuthProvider>{children}</AuthProvider>
            <OfflineNotification />
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
