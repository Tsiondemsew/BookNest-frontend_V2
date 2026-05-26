import type { EntityId, ISODateString } from './common';
import type { UserRole, AccountStatus } from './auth';

// Dashboard Statistics
export interface DashboardStats {
  totalRevenue: number;
  revenueChange: number; // percentage change
  totalUsers: number;
  usersChange: number;
  totalReaders: number;
  readersChange: number;
  totalAuthors: number;
  authorsChange: number;
  pendingBooks: number;
  pendingReports: number;
  bannedUsers: number;
}

// Revenue Chart Data
export interface RevenueChartData {
  date: ISODateString;
  revenue: number;
  orders: number;
}

// User Chart Data
export interface UserChartData {
  date: ISODateString;
  readers: number;
  authors: number;
  total: number;
}

// Books Chart Data
export interface BookChartData {
  date: ISODateString;
  newBooks: number;
  approvedBooks: number;
  rejectedBooks: number;
}

// Admin User Management
export interface AdminUser {
  id: EntityId;
  email: string;
  publicName: string;
  role: UserRole;
  accountStatus: AccountStatus;
  createdAt: ISODateString;
  booksCount?: number;
  purchasesCount?: number;
  reportsCount?: number;
}

// Admin Book Management
export interface AdminBook {
  id: EntityId;
  title: string;
  author: {
    id: EntityId;
    publicName: string;
    email: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: ISODateString;
  genre: string;
  description?: string;
  reviewNotes?: string;
}

// Admin Report Management
export interface AdminReport {
  id: EntityId;
  type: 'book' | 'user' | 'content';
  reportedItem: {
    id: EntityId;
    type: string;
    title?: string;
  };
  reportedBy: {
    id: EntityId;
    email: string;
  };
  reason: string;
  description?: string;
  status: 'open' | 'investigating' | 'resolved';
  createdAt: ISODateString;
  resolvedAt?: ISODateString;
  resolutionNotes?: string;
}
