import type {
  SyncProgressRequest,
  SyncProgressResponse,
} from '@repo/types';
import { ApiClient } from './client';
import { endpoints } from './endpoints';

export function createProgressApi(client: ApiClient) {
  return {
    syncProgress: (payload: SyncProgressRequest) =>
      client.post<SyncProgressResponse, SyncProgressRequest>(endpoints.progress.sync, payload),
  };
}
