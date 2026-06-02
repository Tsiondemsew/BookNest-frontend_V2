import type { ApiClient } from './client';
import { adminEndpoints } from './adminEndpoints';

export type AdminDashboardStats = {
  total_users: number;
  total_books: number;
  pending_books: number;
  pending_reports: number;
  pending_withdrawals: number;
  total_revenue: number;
};

export type AdminSystemAnalytics = {
  period_days: number;
  users_over_time: Array<{ date: string; count: number }>;
  books_over_time: Array<{ date: string; count: number }>;
  sales_over_time: Array<{ date: string; sales: number; revenue: number }>;
  users_by_role: Array<{ role: string; count: number }>;
  books_by_status: Array<{ status: string; count: number }>;
  top_books: Array<{
    book_id: string;
    title: string;
    copies_sold: number;
    revenue: number;
  }>;
};

export type AdminUserRow = {
  id: string;
  email: string;
  role: string;
  account_status: string;
  is_email_verified?: boolean;
  created_at: string;
  display_name?: string;
  avatar_url?: string | null;
  bio?: string | null;
};

export type AdminUserDetail = {
  user: AdminUserRow & { updated_at?: string; location?: string | null; website_url?: string | null };
  stats: {
    post_count: number;
    book_count: number;
    pending_report_count: number;
  };
  posts: Array<{
    id: string;
    content: string;
    image_url?: string | null;
    status: string;
    like_count?: number | null;
    comment_count?: number | null;
    created_at: string;
  }>;
  books: Array<{
    id: string;
    title: string;
    status: string;
    cover_image_url?: string | null;
    is_active?: boolean;
    created_at: string;
  }>;
  reports: AdminReportRow[];
};

export type AdminReportRow = {
  id: string;
  target_type: string;
  target_id: string;
  reason: string;
  details?: string | null;
  status: string | null;
  created_at: string;
  reporter?: { id: string; email: string } | null;
  subject_user_id?: string | null;
  subject_user?: {
    id: string;
    email: string;
    role?: string | null;
    account_status?: string | null;
  } | null;
  post?: {
    id: string;
    content: string;
    image_url?: string | null;
    status: string;
    created_at: string;
    author_email?: string | null;
  } | null;
};

export type AdminBookFormat = {
  id: string;
  format_type: string;
  price: number;
  status: string;
  is_active?: boolean;
  storage_path?: string | null;
  file_size_bytes?: number | null;
  page_count?: number | null;
  duration_sec?: number | null;
  preview_url?: string | null;
};

export type AdminBookRow = {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  author_name: string;
  language: string;
  status: string;
  is_active?: boolean;
  isbn?: string | null;
  cover_image_url?: string | null;
  uploaded_by: string;
  uploaded_by_role?: string | null;
  uploader_email?: string | null;
  genre_name?: string | null;
  publisher_name?: string | null;
  publication_date?: string | null;
  reviewed_at?: string | null;
  updated_at?: string | null;
  created_at: string;
  formats: AdminBookFormat[];
};

export type AdminWithdrawalRow = {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  payout_details?: unknown;
  created_at: string;
  user_email?: string | null;
  user_role?: string | null;
};

export function createAdminApi(client: ApiClient) {
  return {
    getDashboard: () =>
      client.get<{ success: boolean; data: AdminDashboardStats }>(adminEndpoints.dashboard),

    getSystemAnalytics: () =>
      client.get<{ success: boolean; data: AdminSystemAnalytics }>(adminEndpoints.analytics),

    listUsers: (params?: { role?: string; q?: string; account_status?: string }) => {
      const qs = new URLSearchParams();
      if (params?.role) qs.set('role', params.role);
      if (params?.q) qs.set('q', params.q);
      if (params?.account_status) qs.set('account_status', params.account_status);
      const query = qs.toString();
      return client.get<{ success: boolean; data: { users: AdminUserRow[] } }>(
        `${adminEndpoints.users}${query ? `?${query}` : ''}`
      );
    },

    getUser: (id: string) =>
      client.get<{ success: boolean; data: AdminUserDetail }>(adminEndpoints.user(id)),

    updateUserStatus: (id: string, account_status: 'active' | 'suspended' | 'disabled') =>
      client.patch<{ success: boolean; data: AdminUserRow }>(adminEndpoints.userStatus(id), {
        account_status,
      }),

    inviteUser: (payload: {
      email: string;
      role: 'author' | 'publisher';
      display_name?: string;
      pen_name?: string;
      company_name?: string;
    }) =>
      client.post<{ success: boolean; data: { user_id: string; email: string; role: string } }>(
        adminEndpoints.invites,
        payload
      ),

    listBooks: (params?: { status?: string; q?: string }) => {
      const qs = new URLSearchParams();
      if (params?.status) qs.set('status', params.status);
      if (params?.q) qs.set('q', params.q);
      const query = qs.toString();
      return client.get<{ success: boolean; data: { books: AdminBookRow[] } }>(
        `${adminEndpoints.books}${query ? `?${query}` : ''}`
      );
    },

    getBook: (id: string) =>
      client.get<{ success: boolean; data: AdminBookRow }>(adminEndpoints.book(id)),

    reviewBook: (id: string, payload: { status: string }) =>
      client.patch<{ success: boolean; data: AdminBookRow }>(
        adminEndpoints.bookReview(id),
        payload
      ),

    listReports: (params?: { status?: string }) => {
      const qs = new URLSearchParams();
      if (params?.status) qs.set('status', params.status);
      const query = qs.toString();
      return client.get<{ success: boolean; data: { reports: AdminReportRow[] } }>(
        `${adminEndpoints.reports}${query ? `?${query}` : ''}`
      );
    },

    updateReport: (id: string, payload: { status: string }) =>
      client.patch<{ success: boolean; data: AdminReportRow }>(
        adminEndpoints.reportUpdate(id),
        payload
      ),

    listWithdrawals: (params?: { status?: string }) => {
      const qs = new URLSearchParams();
      if (params?.status) qs.set('status', params.status);
      const query = qs.toString();
      return client.get<{ success: boolean; data: { withdrawals: AdminWithdrawalRow[] } }>(
        `${adminEndpoints.withdrawals}${query ? `?${query}` : ''}`
      );
    },

    reviewWithdrawal: (
      id: string,
      payload: { status: 'approved' | 'rejected'; admin_note?: string }
    ) =>
      client.patch<{ success: boolean; data: AdminWithdrawalRow }>(
        adminEndpoints.withdrawalReview(id),
        payload
      ),
  };
}
