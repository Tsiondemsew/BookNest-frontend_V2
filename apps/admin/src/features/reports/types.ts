export type TxStatus = 'cleared' | 'pending' | 'refunded';

export interface ReportMetric {
  value: number;
  formatted?: string;
  change: number;
  changeLabel: string;
}

export interface ReportTransaction {
  id: string;
  source: string;
  amount: number;
  amountFormatted: string;
  date: string;
  status: TxStatus;
  bookId: string | null;
  category: string;
}

export interface RevenueTrendPoint {
  date: string;
  label: string;
  amount: number;
}

export interface ReportsCenterData {
  metrics: {
    totalRevenue: ReportMetric;
    activeSessions: ReportMetric;
    systemLatency: ReportMetric;
    failedAuth: ReportMetric;
  };
  financial: {
    transactions: ReportTransaction[];
    revenueTrend: RevenueTrendPoint[];
    trendSummary: string;
    trendChange: string;
  };
  usability: {
    searchIntent: { label: string; value: number; unit: string };
    assetDownloads: { label: string; value: number; unit: string };
    avgLoadTime: { value: string; status: string };
    errorRate: { value: string; status: string };
  };
  summary: {
    totalUsers: number;
    approvedBooks: number;
    pendingBooks: number;
    catalogValue: number;
  };
}
