export interface DashboardOverviewData {
  metrics: {
    monthlyRevenue: { value: number; formatted: string; change: number; changeLabel: string };
    systemHealth: { value: number; formatted: string; status: string };
    activeUsers: { value: number; online: number; change: number; changeLabel: string };
    pendingApprovals: { value: number; urgent: number; actionRequired: boolean };
    userRoleCounts: { users: number; authors: number; publishers: number };
  };
  usabilityIndex: Array<{
    day: string;
    date: string;
    backendLoad: number;
    responseTime: number;
  }>;
  financialSummary: Array<{
    label: string;
    amount: number;
    formatted: string;
    widthPct: number;
  }>;
  topPerformer: { name: string; growth: string; subtitle: string };
  recentApprovals: Array<{
    id: string;
    submissionId: string;
    submitter: string;
    submitterEmail: string | null;
    assetCategory: string;
    dateReceived: string;
    status: 'pending' | 'approved' | 'rejected';
    title: string;
  }>;
}
