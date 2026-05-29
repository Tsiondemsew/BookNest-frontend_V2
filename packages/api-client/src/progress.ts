import type {
  ProgressListResponse,
  ReadingProgressItem,
  SyncProgressRequest,
  SyncProgressResponse,
} from '@repo/types';
import { ApiClient } from './client';
import { endpoints } from './endpoints';

export function createProgressApi(client: ApiClient) {
  return {
    getAllProgress: () => client.get<ProgressListResponse>(endpoints.progress.list),
    getProgressForFormat: (bookFormatId: string) =>
      client.get<{ success: boolean; data: ReadingProgressItem | null }>(
        endpoints.progress.forFormat(bookFormatId)
      ),
    syncProgress: (payload: SyncProgressRequest) =>
      client.post<SyncProgressResponse, SyncProgressRequest>(
        endpoints.progress.sync,
        payload
      ),
  };
}
