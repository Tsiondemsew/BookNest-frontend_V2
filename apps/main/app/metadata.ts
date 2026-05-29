import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'BookNest',
  description: 'Read, buy, and track books — online and offline.',
  applicationName: 'BookNest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'BookNest',
  },
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/icon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#2C3E50',
  width: 'device-width',
  initialScale: 1,
};
