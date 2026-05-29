import {
  getLocalProgress,
  saveLocalProgress,
  getAllUnsyncedProgress,
  markProgressSynced,
  ReadingProgress,
} from '@/lib/db/schema';
import { progressApi } from '@/lib/api/client';
import { useAuthStore } from '@/stores/authStore';

const lastSyncMeta: Record<string, { pages: number; minutes: number }> = {};

export async function mergeProgressFromServer(userId: string): Promise<void> {
  if (!navigator.onLine) return;
  const { isAuthenticated } = useAuthStore.getState();
  if (!isAuthenticated) return;

  try {
    const res = await progressApi.getAllProgress();
    const items = res.data || [];
    for (const row of items) {
      const local = await getLocalProgress(userId, row.book_format_id);
      const serverPos =
        typeof row.last_position === 'number'
          ? row.last_position
          : Number(row.last_position) || 0;
      const useServer =
        !local ||
        row.progress_percent > local.progressPercent ||
        (row.progress_percent === local.progressPercent && serverPos > local.lastPosition);

      if (useServer) {
        await saveLocalProgress({
          id: `${userId}_${row.book_format_id}`,
          userId,
          bookFormatId: row.book_format_id,
          progressPercent: row.progress_percent,
          lastPosition: serverPos,
          total: local?.total || 100,
          updatedAt: row.updated_at,
          synced: 1,
        });
      }
    }
  } catch (e) {
    console.warn('Failed to merge server progress', e);
  }
}

export async function saveProgressLocally(
  userId: string,
  bookFormatId: string,
  progressPercent: number,
  lastPosition: number,
  total: number,
  sessionMeta?: { pagesDelta?: number; minutesDelta?: number }
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

  if (sessionMeta) {
    lastSyncMeta[bookFormatId] = {
      pages: (lastSyncMeta[bookFormatId]?.pages || 0) + (sessionMeta.pagesDelta || 0),
      minutes: (lastSyncMeta[bookFormatId]?.minutes || 0) + (sessionMeta.minutesDelta || 0),
    };
  } else {
    lastSyncMeta[bookFormatId] = lastSyncMeta[bookFormatId] || { pages: 0, minutes: 0 };
  }

  if (navigator.onLine) {
    await syncProgressToBackend();
  }
}

export async function getLocalProgressForBook(
  userId: string,
  bookFormatId: string
): Promise<ReadingProgress | null> {
  return getLocalProgress(userId, bookFormatId);
}

export async function syncProgressToBackend(): Promise<void> {
  if (!navigator.onLine) return;

  const { isAuthenticated } = useAuthStore.getState();
  if (!isAuthenticated) return;

  const unsynced = await getAllUnsyncedProgress();
  if (unsynced.length === 0) return;

  const tzOffset = -new Date().getTimezoneOffset();

  for (const progress of unsynced) {
    try {
      const meta = lastSyncMeta[progress.bookFormatId] || { pages: 0, minutes: 0 };
      await progressApi.syncProgress({
        book_format_id: progress.bookFormatId,
        progress_percent: progress.progressPercent,
        last_position: progress.lastPosition,
        pages_delta: meta.pages,
        minutes_delta: meta.minutes,
        timezone_offset_minutes: tzOffset,
      });

      await markProgressSynced(progress.id);
      lastSyncMeta[progress.bookFormatId] = { pages: 0, minutes: 0 };
    } catch (error: unknown) {
      const err = error as { status?: number };
      if (err.status !== 401 && err.status !== 404) {
        console.error('Failed to sync progress:', error);
      }
    }
  }
}

export function initOfflineSync(): void {
  window.addEventListener('online', () => {
    syncProgressToBackend();
    const { user, isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated && user) {
      mergeProgressFromServer(user.id);
    }
  });

  setInterval(() => {
    if (navigator.onLine) syncProgressToBackend();
  }, 5 * 60 * 1000);

  if (navigator.onLine) {
    setTimeout(() => syncProgressToBackend(), 3000);
  }
}
