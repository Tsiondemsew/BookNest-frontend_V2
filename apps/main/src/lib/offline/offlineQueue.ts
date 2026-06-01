import { progressApi } from '@/lib/api/client';
import {
  deleteOfflineQueueItem,
  enqueueOfflineQueueItem,
  getAllOfflineQueueItems,
  updateOfflineQueueRetries,
  type OfflineQueueItem,
} from '@/lib/db/schema';
import { syncProgressToBackend } from '@/lib/progress/progressService';
import { useAuthStore } from '@/stores/authStore';

const MAX_RETRIES = 5;

let processing = false;

export async function enqueueProgressSyncRetry(bookFormatId: string, payload: Record<string, unknown>) {
  await enqueueOfflineQueueItem({
    action: 'UPDATE_PROGRESS',
    payload: { book_format_id: bookFormatId, ...payload },
  });
}

export async function processOfflineQueue(): Promise<void> {
  if (!navigator.onLine || processing) return;

  const { isAuthenticated } = useAuthStore.getState();
  if (!isAuthenticated) return;

  processing = true;
  try {
    await syncProgressToBackend();

    const items = await getAllOfflineQueueItems();
    for (const item of items) {
      await processQueueItem(item);
    }
  } finally {
    processing = false;
  }
}

async function processQueueItem(item: OfflineQueueItem): Promise<void> {
  if (item.retries >= MAX_RETRIES) {
    await deleteOfflineQueueItem(item.id);
    return;
  }

  try {
    if (item.action === 'UPDATE_PROGRESS') {
      const p = item.payload as {
        book_format_id: string;
        progress_percent: number;
        last_position: number;
        timezone_offset_minutes?: number;
      };
      await progressApi.syncProgress({
        book_format_id: p.book_format_id,
        progress_percent: p.progress_percent,
        last_position: p.last_position,
        pages_delta: 0,
        minutes_delta: 0,
        timezone_offset_minutes: p.timezone_offset_minutes ?? -new Date().getTimezoneOffset(),
      });
    }
    await deleteOfflineQueueItem(item.id);
  } catch {
    await updateOfflineQueueRetries(item.id, item.retries + 1);
  }
}
