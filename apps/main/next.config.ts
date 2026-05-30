import type { NextConfig } from 'next';
import path from 'path';
import { fileURLToPath } from 'url';
import withPWAInit from 'next-pwa';
import { pwaRuntimeCaching } from './src/lib/pwa/runtimeCaching';

const monorepoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  customWorkerDir: 'worker',
  /** Service worker is for production builds; use `pnpm build && pnpm start` to test PWA. */
  disable: process.env.NODE_ENV === 'development',
  fallbacks: {
    document: '/offline.html',
  },
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

  transpilePackages: [
    '@repo/ui',
    '@repo/types',
    '@repo/api-client',
    '@repo/validation',
    'lucide-react',
  ],

  outputFileTracingRoot: monorepoRoot,

  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
      'lucide-react': path.join(monorepoRoot, 'node_modules/lucide-react'),
    };
    if (isServer) {
      config.externals = [...(config.externals || []), 'canvas'];
    }
    return config;
  },

  // next-pwa relies on webpack; silence Next 16's turbopack/webpack mismatch warning.
  turbopack: {},
};

export default withPWA(nextConfig);
