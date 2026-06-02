import type { LibraryItem } from '@repo/types';
import { getLibraryCacheFromDb, saveLibraryCacheToDb } from '@/lib/db/schema';

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
  void saveLibraryCacheToDb(items).catch(() => {
    /* IndexedDB unavailable — localStorage still used */
  });
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

/** Load library snapshot from IndexedDB when localStorage is empty (e.g. cleared). */
export async function hydrateLibraryCacheFromDb(): Promise<LibraryItem[] | null> {
  const fromDb = await getLibraryCacheFromDb();
  if (!fromDb?.length) return null;
  saveLibraryCache(fromDb);
  return fromDb;
}

export async function getLibraryCacheAsync(): Promise<LibraryItem[] | null> {
  const local = getLibraryCache();
  if (local?.length) return local;
  return hydrateLibraryCacheFromDb();
}
