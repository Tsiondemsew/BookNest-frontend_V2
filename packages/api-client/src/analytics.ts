import type { AnalyticsResponse, BookPerformanceResponse } from '@repo/types';
import { ApiClient } from './client';
import { endpoints } from './endpoints';

import type { SalesReport, SellerReviewsResponse } from '@repo/types';

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
    getBookPerformance: () =>
      client.get<BookPerformanceResponse>(endpoints.analytics.performance),
    getSellerReviews: (params?: { limit?: number; offset?: number }) => {
      const q = new URLSearchParams();
      if (params?.limit != null) q.set('limit', String(params.limit));
      if (params?.offset != null) q.set('offset', String(params.offset));
      const qs = q.toString();
      const path = qs
        ? `${endpoints.analytics.reviews}?${qs}`
        : endpoints.analytics.reviews;
      return client.get<SellerReviewsResponse>(path);
    },
  };
}
