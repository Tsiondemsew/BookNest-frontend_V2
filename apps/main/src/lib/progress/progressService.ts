import {
  getLocalProgress,
  saveLocalProgress,
  getAllUnsyncedProgress,
  markProgressSynced,
  ReadingProgress,
} from '@/lib/db/schema';
import { progressApi } from '@/lib/api/client';
import { useAuthStore } from '@/stores/authStore';

let mergeInFlight: Promise<void> | null = null;
let lastMergeAt = 0;
const MERGE_COOLDOWN_MS = 15_000;

export async function mergeProgressFromServer(userId: string): Promise<void> {
  if (!navigator.onLine) return;
  const { isAuthenticated } = useAuthStore.getState();
  if (!isAuthenticated) return;

  const now = Date.now();
  if (mergeInFlight) return mergeInFlight;
  if (now - lastMergeAt < MERGE_COOLDOWN_MS) return;

  mergeInFlight = (async () => {
    try {
      const res = await progressApi.getAllProgress();
      lastMergeAt = Date.now();
      const items = res.data || [];
      for (const row of items) {
        const local = await getLocalProgress(userId, row.book_format_id);
        const serverPos =
          typeof row.last_position === 'number'
            ? row.last_position
            : Number(row.last_position) || 0;
        const serverPercent = row.progress_percent ?? 0;
        const localPercent = local?.progressPercent ?? 0;
        const mergedPercent = Math.max(localPercent, serverPercent);
        const serverNewer =
          !local ||
          new Date(row.updated_at).getTime() >= new Date(local.updatedAt).getTime();
        const mergedPosition = serverNewer ? serverPos : (local?.lastPosition ?? serverPos);

        if (
          !local ||
          mergedPercent !== localPercent ||
          mergedPosition !== local.lastPosition ||
          serverPercent !== localPercent
        ) {
          await saveLocalProgress({
            id: `${userId}_${row.book_format_id}`,
            userId,
            bookFormatId: row.book_format_id,
            progressPercent: mergedPercent,
            lastPosition: mergedPosition,
            total: local?.total || 100,
            updatedAt: row.updated_at,
            synced: mergedPercent === localPercent && mergedPosition === local?.lastPosition ? 1 : 0,
            pendingPagesDelta: local?.pendingPagesDelta ?? 0,
            pendingMinutesDelta: local?.pendingMinutesDelta ?? 0,
          });
        }
      }
    } catch (e) {
      // Tab backgrounding / transient network errors are common while audio plays
      if (document.visibilityState === 'visible') {
        console.warn('Failed to merge server progress', e);
      }
    } finally {
      mergeInFlight = null;
    }
  })();

  return mergeInFlight;
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
    pendingPagesDelta: 0,
    pendingMinutesDelta: 0,
  };

  await saveLocalProgress(progress);

  if (navigator.onLine) {
    void syncProgressToBackend().catch(() => {
      /* bookmark sync is best-effort; reading stats use /gamification/activity */
    });
  }
}

export async function getLocalProgressForBook(
  userId: string,
  bookFormatId: string
): Promise<ReadingProgress | null> {
  return getLocalProgress(userId, bookFormatId);
}

let syncInFlight: Promise<void> | null = null;

export async function syncProgressToBackend(): Promise<void> {
  if (!navigator.onLine) return;

  const { isAuthenticated } = useAuthStore.getState();
  if (!isAuthenticated) return;

  if (syncInFlight) return syncInFlight;

  syncInFlight = (async () => {
    const unsynced = await getAllUnsyncedProgress();
    if (unsynced.length === 0) return;

    const tzOffset = -new Date().getTimezoneOffset();

    for (const progress of unsynced) {
      try {
        await progressApi.syncProgress({
          book_format_id: progress.bookFormatId,
          progress_percent: progress.progressPercent,
          last_position: progress.lastPosition,
          pages_delta: 0,
          minutes_delta: 0,
          timezone_offset_minutes: tzOffset,
        });

        await markProgressSynced(progress.id, true);
      } catch (error: unknown) {
        const err = error as { status?: number; message?: string };
        if (err.status === 401 || err.status === 404 || err.status === 403) {
          return;
        }
        console.warn(
          'Progress bookmark sync failed (will retry):',
          err.status ? `${err.status} ${err.message}` : err.message || error
        );
      }
    }
  })().finally(() => {
    syncInFlight = null;
  });

  return syncInFlight;
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
