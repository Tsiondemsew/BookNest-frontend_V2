import type { NextConfig } from 'next';
import nextIntl from 'next-intl/plugin';
import { withSentryConfig } from '@sentry/nextjs';

// Create the next-intl wrapper
const withNextIntl = nextIntl({
  requestConfig: './src/i18n/request.ts',
});

// Your base config
const nextConfig: NextConfig = {
  turbopack: {
    root: require('path').join(__dirname, '..', '..'),
  },
};

// Apply next-intl first
const configWithIntl = withNextIntl(nextConfig);

// Then apply Sentry
export default withSentryConfig(configWithIntl, {
  org: "booknest",
  project: "web-app",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
    sourcemaps: {
    disable: true,
  },
});