/**
 * Client-side cache layer for managing API responses
 * Provides TTL-based caching and offline fallback
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // milliseconds
}

const cache = new Map<string, CacheEntry<any>>();

/**
 * Get cached value if still valid
 */
export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  const isExpired = Date.now() - entry.timestamp > entry.ttl;

  if (isExpired) {
    cache.delete(key);
    return null;
  }

  return entry.data as T;
}

/**
 * Set cached value with TTL
 */
export function setCached<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
}

/**
 * Check if cache key exists and is valid
 */
export function isCached(key: string): boolean {
  const entry = cache.get(key);

  if (!entry) {
    return false;
  }

  const isExpired = Date.now() - entry.timestamp > entry.ttl;

  if (isExpired) {
    cache.delete(key);
    return false;
  }

  return true;
}

/**
 * Clear specific cache entry
 */
export function clearCache(key: string): void {
  cache.delete(key);
}

/**
 * Clear all cache entries matching a pattern
 */
export function clearCachePattern(pattern: RegExp): void {
  const keysToDelete: string[] = [];

  for (const key of cache.keys()) {
    if (pattern.test(key)) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach(key => cache.delete(key));
}

/**
 * Clear all cache
 */
export function clearAllCache(): void {
  cache.clear();
}

/**
 * Get cache stats for debugging
 */
export function getCacheStats(): {
  size: number;
  entries: string[];
} {
  return {
    size: cache.size,
    entries: Array.from(cache.keys()),
  };
}

/**
 * Smart fetch with cache, offline fallback, and retry logic
 */
export async function cachedFetch<T>(
  url: string,
  options: {
    ttl?: number; // Cache TTL in milliseconds
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: unknown;
    credentials?: 'include' | 'omit' | 'same-origin';
    skipCache?: boolean;
    retries?: number;
    retryDelay?: number;
  } = {}
): Promise<T> {
  const {
    ttl = 5 * 60 * 1000,
    method = 'GET',
    body,
    credentials = 'include',
    skipCache = method !== 'GET',
    retries = 3,
    retryDelay = 1000,
  } = options;

  const cacheKey = `${method}:${url}:${body ? JSON.stringify(body) : ''}`;

  // For GET requests, check cache first
  if (method === 'GET' && !skipCache) {
    const cached = getCached<T>(cacheKey);
    if (cached !== null) {
      return cached;
    }
  }

  let lastError: Error | null = null;

  // Try to fetch with retry logic
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Cache successful GET responses
      if (method === 'GET' && !skipCache) {
        setCached(cacheKey, data, ttl);
      }

      return data as T;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // For offline or network errors, try cache before retrying
      if (!navigator.onLine && method === 'GET') {
        const cached = getCached<T>(cacheKey);
        if (cached !== null) {
          return cached;
        }
      }

      // Retry with exponential backoff
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError || new Error('Failed to fetch after retries');
}

/**
 * Invalidate cache for a resource after mutation
 */
export function invalidateCache(patterns: RegExp[]): void {
  patterns.forEach(pattern => clearCachePattern(pattern));
}
