import type { GamificationProfile } from '@repo/types';
import { ApiClient } from './client';
import { endpoints } from './endpoints';

export type OfflineBatchProgressItem = {
  book_format_id: string;
  progress_percent: number;
  last_position: number;
  timezone_offset_minutes?: number;
};

export type OfflineBatchActivity = {
  pages_delta?: number;
  minutes_delta?: number;
  seconds_delta?: number;
  timezone_offset_minutes?: number;
};

export type OfflineBatchResponse = {
  success: boolean;
  data: {
    progress: Array<{ book_format_id: string; ok: boolean; error?: string }>;
    activity: { recorded: boolean; pages?: number; minutes?: number; seconds?: number } | null;
    profile: GamificationProfile | null;
  };
};

export function createSyncApi(client: ApiClient) {
  return {
    offlineBatch: (payload: {
      progress?: OfflineBatchProgressItem[];
      activity?: OfflineBatchActivity;
    }) =>
      client.post<OfflineBatchResponse>(endpoints.sync.offline, {
        progress: payload.progress ?? [],
        activity: payload.activity,
      }),
  };
}
