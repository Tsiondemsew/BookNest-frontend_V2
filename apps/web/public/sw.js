/**
 * Service Worker for BookNest
 * 
 * Handles:
 * - Asset caching (static files)
 * - Network-first strategy for API calls
 * - Stale-while-revalidate for books data
 * - Offline detection and fallback pages
 * - Background sync for queued actions
 * 
 * Cache names follow versioning pattern for updates
 */

const ASSET_CACHE = 'booknest-assets-v1';
const API_CACHE = 'booknest-api-v1';
const IMAGE_CACHE = 'booknest-images-v1';
const OFFLINE_PAGE = '/offline.html';

// Files to cache on install
const ESSENTIAL_ASSETS = [
  '/',
  '/login',
  '/register',
  '/offline.html',
];

/**
 * Install event - Cache essential assets
 */
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');

  event.waitUntil(
    caches.open(ASSET_CACHE).then((cache) => {
      console.log('[ServiceWorker] Caching essential assets');
      return cache.addAll(ESSENTIAL_ASSETS);
    })
  );

  self.skipWaiting();
});

/**
 * Activate event - Clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== ASSET_CACHE &&
            cacheName !== API_CACHE &&
            cacheName !== IMAGE_CACHE
          ) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  self.clients.claim();
});

/**
 * Fetch event - Implement caching strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip non-HTTP(S) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // API requests - Network first, fall back to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Images - Cache first, fall back to network
  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
    return;
  }

  // Static assets - Cache first
  if (isStaticAsset(url.pathname)) {
    event.respondWith(handleAssetRequest(request));
    return;
  }

  // Navigation requests - Network first
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }
});

/**
 * Handle API requests - Network first
 */
async function handleApiRequest(request) {
  try {
    // Try network first
    const response = await fetch(request);

    // Cache successful responses
    if (response.ok && request.method === 'GET') {
      const cache = await caches.open(API_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // Fall back to cache if network fails
    const cached = await caches.match(request);
    if (cached) {
      console.log('[ServiceWorker] Serving from API cache:', request.url);
      return cached;
    }

    // Return error response
    return new Response('Network error', { status: 503 });
  }
}

/**
 * Handle image requests - Cache first
 */
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);

    if (response.ok) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // Return placeholder for missing images
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300"><rect fill="#ccc" width="200" height="300"/></svg>',
      {
        headers: { 'Content-Type': 'image/svg+xml' },
      }
    );
  }
}

/**
 * Handle static assets - Cache first
 */
async function handleAssetRequest(request) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);

    if (response.ok) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    return new Response('Asset not found', { status: 404 });
  }
}

/**
 * Handle navigation requests - Network first with offline fallback
 */
async function handleNavigationRequest(request) {
  try {
    return await fetch(request);
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    // Return offline page
    const offline = await caches.match(OFFLINE_PAGE);
    if (offline) {
      return offline;
    }

    return new Response('Offline', { status: 503 });
  }
}

/**
 * Check if URL is a static asset
 */
function isStaticAsset(pathname) {
  const staticExtensions = ['.js', '.css', '.woff', '.woff2', '.ttf'];
  return staticExtensions.some((ext) => pathname.endsWith(ext));
}

/**
 * Message handling for communication with app
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
