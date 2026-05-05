import type { AnalyticsResponse } from '@repo/types';
import { ApiClient } from './client';
import { endpoints } from './endpoints';

export function createAnalyticsApi(client: ApiClient) {
  return {
    getSalesAnalytics: () =>
      client.get<AnalyticsResponse>(endpoints.analytics.sales),
  };
}