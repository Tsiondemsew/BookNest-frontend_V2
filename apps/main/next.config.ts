import type { NextConfig } from 'next';
import withPWAInit from 'next-pwa';
import { pwaRuntimeCaching } from './src/lib/pwa/runtimeCaching';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  /** Service worker is for production builds; use `pnpm build && pnpm start` to test PWA. */
  disable: process.env.NODE_ENV === 'development',
  /** Offline document is handled via runtime NetworkFirst + public/offline.html */
  runtimeCaching: pwaRuntimeCaching,
  buildExcludes: [/middleware-manifest\.json$/],
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'book-nest-webapp.vercel.app',
        port: '',
        pathname: '/**',
      },
    ],
  },

  transpilePackages: ['@repo/ui', '@repo/types', '@repo/api-client', '@repo/validation'],

  // next-pwa relies on webpack; silence Next 16's turbopack/webpack mismatch warning.
  turbopack: {},
};

export default withPWA(nextConfig);
