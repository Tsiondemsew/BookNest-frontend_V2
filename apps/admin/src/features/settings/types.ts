export type AdminPlatformSettings = {
  revenue: {
    commission_percent: number;
    currency: string;
    minimum_payout_amount: number;
    tax_label: string;
    show_tax_in_reports: boolean;
  };
  books: {
    require_revenue_agreement: boolean;
    dual_format_review_required: boolean;
    max_audio_upload_mb: number;
    max_pdf_upload_mb: number;
    default_review_sla_days: number;
    allow_author_pricing_updates: boolean;
  };
  notifications: {
    email_on_new_submission: boolean;
    email_on_sale: boolean;
    email_on_user_registration: boolean;
    email_on_book_rejected: boolean;
    in_app_notifications: boolean;
    digest_email_weekly: boolean;
  };
  reports: {
    default_range_days: number;
    default_export_format: 'csv' | 'xlsx';
    auto_refresh_interval_sec: number;
    show_operational_metrics: boolean;
  };
  platform: {
    maintenance_mode: boolean;
    support_email: string;
    marketplace_name: string;
    allow_new_registrations: boolean;
    default_user_role: string;
  };
  invitations: {
    default_expiry_days: number;
    auto_send_on_create: boolean;
    reminder_before_expiry_days: number;
  };
  payments: {
    primary_gateway: string;
    allow_mock_payments: boolean;
    refund_window_days: number;
  };
};

export type AdminSettingsResponse = {
  settings: AdminPlatformSettings;
  meta: {
    updatedAt: string | null;
    updatedBy: string | null;
  };
};
