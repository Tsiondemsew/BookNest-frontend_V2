export interface SellerWallet {
  user_id?: string;
  available_balance: number;
  pending_balance: number;
  currency: string;
}

export interface SellerEarningsSummary {
  gross_sales: number;
  platform_fees: number;
  net_earnings: number;
  /** Net earnings remaining after approved/paid withdrawals. */
  net_remaining?: number;
  /** Total amount approved/paid out. */
  paid_out?: number;
  platform_fee_percent: number;
  available_balance: number;
  pending_withdrawal: number;
  currency: string;
  sale_count: number;
}

export interface SellerEarning {
  id: string;
  gross_amount: number;
  platform_fee: number;
  net_amount: number;
  created_at: string;
  book_format?: {
    format_type: string;
    book?: { title: string };
  };
}

export interface WithdrawalRequest {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  payout_details: Record<string, string>;
  admin_note?: string | null;
  created_at: string;
  processed_at?: string | null;
}

export interface RequestWithdrawalPayload {
  amount: number;
  payout_details: {
    payment_method: 'cbe' | 'abyssinia' | 'telebirr';
    account_name: string;
    account_number?: string;
    telebirr_phone?: string;
  };
}

export interface SalesReportRow {
  date: string;
  transaction_number?: string;
  book_title: string;
  format_type?: string;
  amount: number;
}

export interface SalesReport {
  rows: SalesReportRow[];
  total_revenue: number;
  total_sales: number;
}
