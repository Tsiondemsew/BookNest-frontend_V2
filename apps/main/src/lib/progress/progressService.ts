import {
  getDB,
  getLocalProgress,
  saveLocalProgress,
  getAllUnsyncedProgress,
  markProgressSynced,
  ReadingProgress,
} from '@/lib/db/schema';
import { progressApi } from '@/lib/api/client';
import { useAuthStore } from '@/stores/authStore';

/**
 * Save reading progress locally (offline-first)
 */
export async function saveProgressLocally(
  userId: string,
  bookFormatId: string,
  progressPercent: number,
  lastPosition: number,
  total: number
): Promise<void> {
  const id = `${userId}_${bookFormatId}`;
  
  const progress: ReadingProgress = {
    id,
    userId,
    bookFormatId,
    progressPercent,
    lastPosition,
    total,
    updatedAt: new Date().toISOString(),
    synced: 0,
  };
  
  await saveLocalProgress(progress);
  
  // Try to sync immediately if online
  if (navigator.onLine) {
    await syncProgressToBackend();
  }
}

/**
 * Get local progress for a book
 */
export async function getLocalProgressForBook(
  userId: string,
  bookFormatId: string
): Promise<ReadingProgress | null> {
  return getLocalProgress(userId, bookFormatId);
}

/**
 * Sync all unsynced progress to backend
 */
export async function syncProgressToBackend(): Promise<void> {
  if (!navigator.onLine) {
    console.log('Offline: skipping sync');
    return;
  }
  
  // ✅ Check if user is authenticated before syncing
  const { isAuthenticated } = useAuthStore.getState();
  if (!isAuthenticated) {
    console.log('Not authenticated: skipping sync');
    return;
  }
  
  const unsynced = await getAllUnsyncedProgress();
  
  if (unsynced.length === 0) return;
  
  console.log(`Syncing ${unsynced.length} progress entries...`);
  
  for (const progress of unsynced) {
    try {
      await progressApi.syncProgress({
        book_format_id: progress.bookFormatId,
        progress_percent: progress.progressPercent,
        last_position: progress.lastPosition,
      });
      
      await markProgressSynced(progress.id);
      console.log(`Synced progress for book ${progress.bookFormatId}`);
    } catch (error: any) {
      // ✅ Don't throw error for 401/404 - just log and continue
      if (error.status === 401 || error.status === 404) {
        console.log('Authentication error during sync, will retry later');
      } else {
        console.error(`Failed to sync progress:`, error);
      }
    }
  }
}

/**
 * Initialize offline sync (call once in app)
 */
export function initOfflineSync(): void {
  // Sync when coming back online
  window.addEventListener('online', () => {
    console.log('Back online, syncing progress...');
    syncProgressToBackend();
  });
  
  // Also sync periodically when online (every 5 minutes)
  setInterval(() => {
    if (navigator.onLine) {
      syncProgressToBackend();
    }
  }, 5 * 60 * 1000);
  
  // Initial sync on page load
  if (navigator.onLine) {
    setTimeout(() => syncProgressToBackend(), 3000);
  }
}