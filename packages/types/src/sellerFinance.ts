export interface SellerWallet {
  user_id?: string;
  available_balance: number;
  pending_balance: number;
  currency: string;
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
    account_name: string;
    bank_name?: string;
    account_number?: string;
    mobile_money?: string;
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
