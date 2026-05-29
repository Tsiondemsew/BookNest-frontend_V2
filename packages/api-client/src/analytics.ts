import type { AnalyticsResponse } from '@repo/types';
import { ApiClient } from './client';
import { endpoints } from './endpoints';

import type { SalesReport } from '@repo/types';

export function createAnalyticsApi(client: ApiClient) {
  return {
    getSalesAnalytics: () =>
      client.get<AnalyticsResponse>(endpoints.analytics.sales),
    getSalesReport: (params?: { from?: string; to?: string }) => {
      const q = new URLSearchParams();
      if (params?.from) q.set('from', params.from);
      if (params?.to) q.set('to', params.to);
      const qs = q.toString();
      const path = qs
        ? `${endpoints.analytics.salesReport}?${qs}`
        : endpoints.analytics.salesReport;
      return client.get<{ success: boolean; data: SalesReport }>(path);
    },
  };
}