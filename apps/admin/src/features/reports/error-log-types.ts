export type ErrorLogLevel = 'error' | 'warn' | 'info';

export interface ErrorLogItem {
  id: string;
  level: ErrorLogLevel;
  message: string;
  code: string | null;
  statusCode: number | null;
  path: string | null;
  method: string | null;
  userId: string | null;
  stack: string | null;
  metadata: Record<string, unknown> | null;
  resolved: boolean;
  resolvedAt: string | null;
  resolvedBy: string | null;
  createdAt: string;
  createdAtFormatted: string;
}

export interface ErrorLogsData {
  tableReady: boolean;
  items: ErrorLogItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  stats: {
    tableReady: boolean;
    total: number;
    unresolved: number;
    resolved: number;
    byLevel: { error: number; warn: number; info: number };
    byLevelUnresolved: { error: number; warn: number; info: number };
    last24h: number;
    errorRate: string;
    errorRateStatus: string;
  };
}

export type ErrorLogLevelFilter = 'all' | ErrorLogLevel;
export type ErrorLogStatusFilter = 'all' | 'unresolved' | 'resolved';
