import type { RuntimeCaching } from 'next-pwa';

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const apiBase =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:5000';
const apiPattern = new RegExp(`^${escapeRegex(apiBase)}/api/.*`, 'i');

/** Never cache auth or API traffic — offline data uses IndexedDB instead. */
const networkOnlyApi: RuntimeCaching = {
  urlPattern: apiPattern,
  handler: 'NetworkOnly',
  options: {
    cacheName: 'booknest-api',
  },
};

const networkOnlySupabase: RuntimeCaching = {
  urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
  handler: 'NetworkOnly',
  options: {
    cacheName: 'booknest-supabase',
  },
};

/** Static assets — stale-while-revalidate for faster repeat visits. */
const staticAssets: RuntimeCaching = {
  urlPattern: /\.(?:js|css|woff2?|png|jpg|jpeg|svg|gif|webp|ico)$/i,
  handler: 'StaleWhileRevalidate',
  options: {
    cacheName: 'booknest-static',
    expiration: {
      maxEntries: 64,
      maxAgeSeconds: 30 * 24 * 60 * 60,
    },
  },
};

/** HTML navigations — network first with offline fallback via next-pwa document fallback. */
const pages: RuntimeCaching = {
  urlPattern: ({ request }: { request: Request }) => request.destination === 'document',
  handler: 'NetworkFirst',
  options: {
    cacheName: 'booknest-pages',
    expiration: {
      maxEntries: 96,
      maxAgeSeconds: 7 * 24 * 60 * 60,
    },
    networkTimeoutSeconds: 8,
  },
};

/** Core app routes — warm cache for offline shell (installed PWA). */
const coreAppRoutes: RuntimeCaching = {
  urlPattern: ({ request, url }) => {
    if (request.destination !== 'document') return false;
    const pathname = url?.pathname ?? new URL(request.url).pathname;
    return /^\/($|library|community|login|offline\.html)(\/|$)/.test(pathname);
  },
  handler: 'NetworkFirst',
  options: {
    cacheName: 'booknest-core-routes',
    expiration: {
      maxEntries: 16,
      maxAgeSeconds: 14 * 24 * 60 * 60,
    },
    networkTimeoutSeconds: 6,
  },
};

export const pwaRuntimeCaching: RuntimeCaching[] = [
  networkOnlyApi,
  networkOnlySupabase,
  coreAppRoutes,
  pages,
  staticAssets,
];
