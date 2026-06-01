export type RevenuePreset =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'this_year'
  | 'custom'
  | 'all';

export type RevenueSummary = {
  totalRevenue: number;
  platformCommission: number;
  authorEarnings: number;
  totalBooksSold: number;
  totalCustomers: number;
  activeAuthors: number;
};

export type RevenueSaleRow = {
  id: string;
  bookId: string;
  bookCover: string | null;
  bookTitle: string;
  author: string;
  authorId: string | null;
  publisher: string;
  category: string;
  customer: string;
  customerId: string;
  purchaseDate: string | null;
  purchaseTime: string | null;
  quantity: number;
  bookPrice: number;
  commissionPercent: number;
  commissionAmount: number;
  authorEarnings: number;
  paymentMethod: string;
  transactionId: string;
  status: string;
  isbn: string;
  language: string;
  format: string;
};

export type PeriodReportRow = {
  period: string;
  booksSold: number;
  revenue: number;
  commission: number;
  authorEarnings: number;
};

export type RevenueDashboardData = {
  tableReady: boolean;
  preset: string;
  range: { from: string | null; to: string | null };
  commissionPercent: number;
  summary: RevenueSummary;
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
};

export type RevenueSalesResponse = {
  tableReady: boolean;
  range: { from: string | null; to: string | null };
  commissionPercent: number;
  summary: RevenueSummary;
  sales: RevenueSaleRow[];
  pagination: { page: number; limit: number; total: number; pages: number };
};
