import type { OfflineBatchProgressItem } from '@repo/api-client';
import { syncApi } from '@/lib/api/client';
import {
  deleteOfflineQueueItem,
  enqueueOfflineQueueItem,
  getAllOfflineQueueItems,
  getAllUnsyncedProgress,
  markProgressSynced,
  updateOfflineQueueRetries,
  type OfflineQueueItem,
} from '@/lib/db/schema';
import { saveGamificationCache } from '@/lib/offline/gamificationCache';
import {
  clearPendingActivity,
  peekPendingActivity,
} from '@/lib/reading/recordActivity';
import { useAuthStore } from '@/stores/authStore';

import { setOfflineQueueProcessing, isOfflineQueueProcessing } from '@/lib/offline/offlineSyncState';

const MAX_RETRIES = 5;
let processing = false;

export async function enqueueProgressSyncRetry(
  bookFormatId: string,
  payload: Record<string, unknown>
) {
  await enqueueOfflineQueueItem({
    action: 'UPDATE_PROGRESS',
    payload: { book_format_id: bookFormatId, ...payload },
  });
}

function mergeProgressItem(
  map: Map<string, OfflineBatchProgressItem>,
  item: OfflineBatchProgressItem,
  tz: number
) {
  const existing = map.get(item.book_format_id);
  if (!existing) {
    map.set(item.book_format_id, {
      ...item,
      timezone_offset_minutes: item.timezone_offset_minutes ?? tz,
    });
    return;
  }
  if (item.progress_percent >= existing.progress_percent) {
    map.set(item.book_format_id, {
      book_format_id: item.book_format_id,
      progress_percent: Math.max(existing.progress_percent, item.progress_percent),
      last_position:
        item.progress_percent >= existing.progress_percent
          ? item.last_position
          : existing.last_position,
      timezone_offset_minutes: tz,
    });
  }
}

export async function processOfflineQueue(): Promise<void> {
  if (!navigator.onLine || processing || isOfflineQueueProcessing()) return;

  const { isAuthenticated, user } = useAuthStore.getState();
  if (!isAuthenticated || !user) return;

  processing = true;
  setOfflineQueueProcessing(true);
  const tz = -new Date().getTimezoneOffset();

  try {
    const unsynced = await getAllUnsyncedProgress();
    const queueItems = await getAllOfflineQueueItems();
    const progressMap = new Map<string, OfflineBatchProgressItem>();

    for (const progress of unsynced) {
      mergeProgressItem(
        progressMap,
        {
          book_format_id: progress.bookFormatId,
          progress_percent: progress.progressPercent,
          last_position: progress.lastPosition,
        },
        tz
      );
    }

    for (const item of queueItems) {
      if (item.action !== 'UPDATE_PROGRESS') continue;
      const p = item.payload as {
        book_format_id: string;
        progress_percent: number;
        last_position: number;
        timezone_offset_minutes?: number;
      };
      if (!p.book_format_id) continue;
      mergeProgressItem(progressMap, p, tz);
    }

    const pending = peekPendingActivity();
    const hasActivity =
      !!pending &&
      ((pending.pages ?? 0) > 0 || (pending.minutes ?? 0) > 0 || (pending.seconds ?? 0) > 0);

    if (progressMap.size === 0 && !hasActivity) {
      for (const item of queueItems) {
        if (item.action === 'CREATE_REVIEW') {
          await processLegacyQueueItem(item);
        }
      }
      return;
    }

    const response = await syncApi.offlineBatch({
      progress: Array.from(progressMap.values()),
      activity: hasActivity
        ? {
            pages_delta: pending!.pages ?? 0,
            minutes_delta: pending!.minutes ?? 0,
            seconds_delta: pending!.seconds ?? 0,
            timezone_offset_minutes: tz,
          }
        : undefined,
    });

    const batchResults = response.data?.progress ?? [];

    for (const progress of unsynced) {
      const result = batchResults.find((r) => r.book_format_id === progress.bookFormatId);
      if (result?.ok) {
        await markProgressSynced(progress.id, true);
      }
    }

    for (const item of queueItems) {
      if (item.action === 'UPDATE_PROGRESS') {
        const bookFormatId = (item.payload as { book_format_id?: string }).book_format_id;
        const result = batchResults.find((r) => r.book_format_id === bookFormatId);
        if (result?.ok) {
          await deleteOfflineQueueItem(item.id);
        } else if (!result) {
          await deleteOfflineQueueItem(item.id);
        } else {
          await updateOfflineQueueRetries(item.id, item.retries + 1);
        }
      } else if (item.action === 'CREATE_REVIEW') {
        await processLegacyQueueItem(item);
      }
    }

    if (response.data?.activity?.recorded) {
      clearPendingActivity();
    }

    if (response.data?.profile) {
      saveGamificationCache(response.data.profile);
    }
  } catch {
    const queueItems = await getAllOfflineQueueItems();
    for (const item of queueItems) {
      if (item.retries >= MAX_RETRIES) {
        await deleteOfflineQueueItem(item.id);
      } else if (item.action === 'UPDATE_PROGRESS' || item.action === 'CREATE_REVIEW') {
        await updateOfflineQueueRetries(item.id, item.retries + 1);
      }
    }
  } finally {
    processing = false;
    setOfflineQueueProcessing(false);
  }
}

async function processLegacyQueueItem(item: OfflineQueueItem): Promise<void> {
  if (item.retries >= MAX_RETRIES) {
    await deleteOfflineQueueItem(item.id);
    return;
  }

  try {
    if (item.action === 'CREATE_REVIEW') {
      // Reserved for future offline review queue
    }
    await deleteOfflineQueueItem(item.id);
  } catch {
    await updateOfflineQueueRetries(item.id, item.retries + 1);
  }
}
