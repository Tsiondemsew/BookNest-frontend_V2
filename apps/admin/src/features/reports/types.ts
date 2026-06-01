import type { SaleFormatFilter } from '@/lib/sale-format';

export type { SaleFormatFilter };

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
  bookTitle?: string;
  author?: string;
  category: string;
  customer?: string;
  publisher?: string;
  commissionAmount?: number;
  authorEarnings?: number;
  commissionPercent?: number;
  paymentMethod?: string;
  purchaseTime?: string | null;
  isbn?: string;
  format?: string;
  genre?: string;
}

export interface RevenueTrendPoint {
  date: string;
  label: string;
  amount: number;
}

export type UserGrowthTrendPoint = {
  day?: string;
  date: string;
  label: string;
  signups: number;
};

export type UserGrowthRoleFilter = 'all' | 'reader' | 'author' | 'publisher';

export type GrowthComparisonMetric = {
  current: number;
  previous: number;
  change: number;
  changeLabel: string;
  label: string;
};

export type OperationalReportData = {
  days: number;
  metrics: {
    activeUsers24h: number;
    suspendedAccounts: number;
    pendingModeration: number;
    approvedCatalog: number;
    catalogFormats: number;
    totalUsers: number;
    failedPayments: number;
    pendingPayments: number;
  };
  moderation: {
    pending: number;
    approved: number;
    rejected: number;
    changesRequested: number;
  };
  errorLogs: {
    tableReady: boolean;
    total: number;
    unresolved: number;
    resolved: number;
    last24h: number;
    byLevel: { error: number; warn: number; info: number };
    errorRate: string;
    errorRateStatus: string;
  };
  systemHealth: {
    avgResponseTimeMs: number;
    peakBackendLoad: number;
    latencyMs: number;
    latencyChangeLabel: string;
    activeSessionsChangeLabel: string;
  };
  activityTrend: Array<{
    day: string;
    date: string;
    backendLoad: number;
    responseTime: number;
  }>;
  activityComparison: {
    current: number;
    previous: number;
    change: number;
    changeLabel: string;
    label: string;
  };
  catalogOps: {
    searchVolume: number;
    assetFormats: number;
    avgLoadTime: string;
    avgLoadStatus: string;
  };
};

export type UserGrowthData = {
  days: number;
  summary: {
    totalUsers: number;
    newSignupsInPeriod: number;
    activeUsers24h: number;
    readers: number;
    authors: number;
    publishers: number;
    suspendedOrDisabled: number;
  };
  signupsTrend: UserGrowthTrendPoint[];
  signupsTrendByRole?: Record<UserGrowthRoleFilter, UserGrowthTrendPoint[]>;
  monthlyTrendByRole?: Record<UserGrowthRoleFilter, UserGrowthTrendPoint[]>;
  comparisons?: {
    dayOverDay: GrowthComparisonMetric;
    weekOverWeek: GrowthComparisonMetric;
    monthOverMonth: GrowthComparisonMetric;
    periodHalf: GrowthComparisonMetric;
  };
  roleCounts: { readers: number; authors: number; publishers: number; admins?: number };
  newByRole: { reader: number; author: number; publisher: number; admin: number };
  signupGrowthChange: number;
  signupGrowthLabel: string;
};

export type RevenueSummary = {
  totalRevenue: number;
  platformCommission: number;
  authorEarnings: number;
  totalBooksSold: number;
  totalCustomers: number;
  activeAuthors: number;
};

export type PeriodReportRow = {
  period: string;
  booksSold: number;
  revenue: number;
  commission: number;
  authorEarnings: number;
};

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
  usabilityIndex: Array<{
    day: string;
    date: string;
    backendLoad: number;
    responseTime: number;
  }>;
  summary: {
    totalUsers: number;
    approvedBooks: number;
    pendingBooks: number;
    catalogValue: number;
  };
  revenue?: {
    tableReady: boolean;
    preset?: string;
    range?: { from: string | null; to: string | null };
    commissionPercent: number;
    summary: RevenueSummary;
    dataSource: 'user_purchases' | 'book_sales' | 'catalog_estimate';
    charts: {
      revenueTrend: Array<{
        date: string;
        revenue: number;
        commission: number;
        authorEarnings: number;
      }>;
      commissionDistribution: Array<{ name: string; value: number }>;
      topBooks: Array<{ bookId: string; title: string; sold: number }>;
      topAuthors: Array<{ name: string; revenue: number; sales: number }>;
    };
    reports: {
      daily: PeriodReportRow[];
      weekly: PeriodReportRow[];
      monthly: PeriodReportRow[];
      yearly: PeriodReportRow[];
    };
    formatBreakdown?: {
      pdf: { sales: number; revenue: number; commission?: number; authorEarnings?: number };
      audio: { sales: number; revenue: number; commission?: number; authorEarnings?: number };
      all: { sales: number; revenue: number; commission?: number; authorEarnings?: number };
    };
    formatTotals?: {
      format: SaleFormatFilter;
      totalRevenue: number;
      platformCommission: number;
      authorEarnings: number;
      totalBooksSold: number;
    } | null;
    recentSalesCount?: number;
    activeFormat?: SaleFormatFilter;
  };
  userGrowth?: UserGrowthData;
  operational?: OperationalReportData;
}
