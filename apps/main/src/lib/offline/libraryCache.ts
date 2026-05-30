import type { LibraryItem } from '@repo/types';

const LIBRARY_CACHE_KEY = 'booknest:library_cache';

export function saveLibraryCache(items: LibraryItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      LIBRARY_CACHE_KEY,
      JSON.stringify({ savedAt: new Date().toISOString(), items })
    );
  } catch {
    /* storage full — ignore */
  }
}

export function getLibraryCache(): LibraryItem[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LIBRARY_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { items?: LibraryItem[] };
    return parsed.items?.length ? parsed.items : null;
  } catch {
    return null;
  }
}
