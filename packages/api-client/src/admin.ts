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

export type AdminUserRow = {
  id: string;
  email: string;
  role: string;
  account_status: string;
  is_email_verified?: boolean;
  created_at: string;
};

export type AdminBookRow = {
  id: string;
  title: string;
  status: string;
  review_note?: string | null;
  submitted_at?: string | null;
  created_at: string;
  cover_image_url?: string | null;
};

export type AdminReportRow = {
  id: string;
  target_type: string;
  target_id: string;
  reason: string;
  details?: string | null;
  status: string | null;
  created_at: string;
};

export type AdminWithdrawalRow = {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  payout_details?: unknown;
  created_at: string;
};

export function createAdminApi(client: ApiClient) {
  return {
    getDashboard: () =>
      client.get<{ success: boolean; data: AdminDashboardStats }>(adminEndpoints.dashboard),

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

    reviewBook: (id: string, payload: { status: string; review_note?: string }) =>
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
