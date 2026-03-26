import type { ReactNode } from 'react';
import '@/styles/globals.css';

export const metadata = {
  title: 'BookNest - Discover & Share Stories',
  description: 'A modern PWA for discovering, reading, and sharing books with community features.',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
