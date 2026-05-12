import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Your existing config
  images: {
    domains: ['localhost', 'your-supabase-url.supabase.co'],
  },
};

// PWA configuration
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest\.json$/],
  runtimeCaching: [
    // Cache static pages (login, library, home)
    {
      urlPattern: /^https?:\/\/localhost:3000\/(login|register|library|dashboard)?$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'page-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24, // 24 hours
        },
      },
    },
    // Cache static assets
    {
      urlPattern: /\.(js|css|png|jpg|jpeg|svg|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-assets',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
    // Don't cache API endpoints except library
    {
      urlPattern: /^https?:\/\/localhost:5000\/api\/library/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'library-cache',
        expiration: {
          maxEntries: 5,
          maxAgeSeconds: 60 * 60, // 1 hour
        },
      },
    },
  ],
});

export default withPWA({
  ...nextConfig,
  turbopack: {},
});