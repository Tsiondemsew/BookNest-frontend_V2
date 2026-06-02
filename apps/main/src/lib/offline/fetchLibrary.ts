import { libraryApi } from '@/lib/api/client';
import { getAllOfflineBooks } from '@/lib/db/schema';
import { saveLibraryCache, getLibraryCacheAsync } from '@/lib/offline/libraryCache';
import { mergeLibraryWithOffline } from '@/lib/offline/libraryMerge';
import type { LibraryItem } from '@repo/types';

/** Library list for React Query — cache + IndexedDB downloads when offline. */
export async function fetchLibraryForQuery(): Promise<LibraryItem[]> {
  const offlineBooks = await getAllOfflineBooks();

  if (!navigator.onLine) {
    const cached = await getLibraryCacheAsync();
    const merged = mergeLibraryWithOffline(cached, offlineBooks);
    if (merged.length > 0) return merged;
    throw new Error('OFFLINE_NO_LIBRARY');
  }

  try {
    const response = await libraryApi.getLibrary();
    saveLibraryCache(response.data);
    return response.data;
  } catch {
    const cached = await getLibraryCacheAsync();
    const merged = mergeLibraryWithOffline(cached, offlineBooks);
    if (merged.length > 0) return merged;
    throw new Error('LIBRARY_FETCH_FAILED');
  }
}
