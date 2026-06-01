'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  BookOpen,
  CreditCard,
  FileText,
  LayoutDashboard,
  Mail,
  Palette,
  Settings2,
  Shield,
  User,
  Wallet,
} from 'lucide-react';
import { AdminTopHeader } from '@/components/admin-top-header';
import { useTheme } from '@/components/theme-provider';
import { useSidebar } from '@/components/sidebar-context';
import { useAdminPlatformSettings } from '@/hooks/useAdminPlatformSettings';
import {
  DEFAULT_LOCAL_SETTINGS,
  readLocalSettings,
  writeLocalSettings,
  type AdminLocalSettings,
} from './admin-local-settings';
import { SettingCard, NumberRow, SelectRow, TextRow, ToggleRow } from './settings-ui';
import type { AdminPlatformSettings } from './types';

const SECTIONS = [
  { id: 'platform', label: 'General', icon: Settings2 },
  { id: 'revenue', label: 'Revenue', icon: Wallet },
  { id: 'books', label: 'Books & review', icon: BookOpen },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'invitations', label: 'Invitations', icon: Mail },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'security', label: 'Security & links', icon: Shield },
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];

function SaveBar({
  dirty,
  saving,
  saved,
  error,
  onSave,
  onReset,
}: {
  dirty: boolean;
  saving: boolean;
  saved: boolean;
  error: string | null;
  onSave: () => void;
  onReset: () => void;
}) {
  if (!dirty && !saved && !error) return null;
  return (
    <div className="sticky bottom-0 z-10 -mx-2 mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/95 px-4 py-3 shadow-lg backdrop-blur">
      <div className="text-sm">
        {error && <span className="text-red-600">{error}</span>}
        {!error && saved && !dirty && (
          <span className="font-medium text-emerald-600">Platform settings saved.</span>
        )}
        {!error && dirty && (
          <span className="text-muted">You have unsaved platform changes.</span>
        )}
      </div>
      <div className="flex gap-2">
        {dirty && (
          <button
            type="button"
            onClick={onReset}
            disabled={saving}
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface disabled:opacity-50"
          >
            Discard
          </button>
        )}
        <button
          type="button"
          onClick={onSave}
          disabled={saving || !dirty}
          className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save platform settings'}
        </button>
      </div>
    </div>
  );
}

export function AdminSettingsPage() {
  const [active, setActive] = useState<SectionId>('platform');
  const {
    draft,
    loading,
    saving,
    error,
    saved,
    dirty,
    save,
    resetDraft,
    updateSection,
    meta,
  } = useAdminPlatformSettings();

  const { theme, setTheme, mounted } = useTheme();
  const { collapsed, closeSidebar, openSidebar } = useSidebar();
  const [local, setLocal] = useState<AdminLocalSettings>(DEFAULT_LOCAL_SETTINGS);

  useEffect(() => {
    setLocal(readLocalSettings());
  }, []);

  const patch = <K extends keyof AdminPlatformSettings>(
    section: K,
    p: Partial<AdminPlatformSettings[K]>,
  ) => updateSection(section, p);

  const updateLocal = (p: Partial<AdminLocalSettings>) => {
    const next = writeLocalSettings(p);
    setLocal(next);
    if (p.defaultSidebarCollapsed !== undefined) {
      if (p.defaultSidebarCollapsed) closeSidebar();
      else openSidebar();
    }
  };

  const s = draft;

  return (
    <div className="min-h-screen bg-background">
      <AdminTopHeader adminSubtitle="Settings" />

      <div className="mx-auto max-w-6xl px-6 py-8 lg:px-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Configure marketplace rules, revenue, notifications, reports, and your admin console.
            Profile details are on My Profile.
          </p>
          {meta?.updatedAt && (
            <p className="mt-1 text-xs text-muted">
              Platform settings last saved: {new Date(meta.updatedAt).toLocaleString()}
            </p>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-8 lg:flex-row">
          <nav className="lg:w-52 lg:shrink-0">
            <ul className="flex flex-wrap gap-1 lg:flex-col">
              {SECTIONS.map(({ id, label, icon: Icon }) => (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => setActive(id)}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
                      active === id
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted hover:bg-surface hover:text-foreground'
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="min-w-0 flex-1 space-y-6">
            {loading && (
              <p className="text-sm text-muted">Loading platform settings…</p>
            )}

            {!loading && active === 'platform' && s && (
              <>
                <SettingCard
                  title="Marketplace"
                  description="Name and access controls for the public site."
                >
                  <TextRow
                    label="Marketplace name"
                    value={s.platform.marketplace_name}
                    disabled={loading}
                    onChange={(v) => patch('platform', { marketplace_name: v })}
                  />
                  <TextRow
                    label="Support email"
                    hint="Shown to authors and readers for help requests."
                    type="email"
                    placeholder="support@booknest.com"
                    value={s.platform.support_email}
                    disabled={loading}
                    onChange={(v) => patch('platform', { support_email: v })}
                  />
                  <ToggleRow
                    label="Allow new registrations"
                    hint="When off, only invited users can sign up."
                    checked={s.platform.allow_new_registrations}
                    disabled={loading}
                    onChange={(v) => patch('platform', { allow_new_registrations: v })}
                  />
                  <SelectRow
                    label="Default role for new users"
                    value={s.platform.default_user_role}
                    options={[
                      { value: 'reader', label: 'Reader' },
                      { value: 'author', label: 'Author' },
                      { value: 'publisher', label: 'Publisher' },
                    ]}
                    disabled={loading}
                    onChange={(v) => patch('platform', { default_user_role: v })}
                  />
                </SettingCard>
                <SettingCard
                  title="Maintenance"
                  description="Restrict access while you perform upgrades."
                >
                  <ToggleRow
                    label="Maintenance mode"
                    hint="Readers and authors see a maintenance message; admins can still sign in."
                    checked={s.platform.maintenance_mode}
                    disabled={loading}
                    onChange={(v) => patch('platform', { maintenance_mode: v })}
                  />
                </SettingCard>
              </>
            )}

            {!loading && active === 'revenue' && s && (
              <SettingCard
                title="Revenue & commission"
                description="Applied to new purchases. Existing sales keep their recorded split."
              >
                <NumberRow
                  label="Commission rate"
                  hint="Example: 20% on 100 ETB → platform 20 ETB, seller 80 ETB."
                  value={s.revenue.commission_percent}
                  min={0}
                  max={100}
                  step={0.5}
                  suffix="%"
                  disabled={loading}
                  onChange={(v) => patch('revenue', { commission_percent: v })}
                />
                <SelectRow
                  label="Currency"
                  value={s.revenue.currency}
                  options={[
                    { value: 'ETB', label: 'ETB' },
                    { value: 'USD', label: 'USD' },
                  ]}
                  disabled={loading}
                  onChange={(v) => patch('revenue', { currency: v })}
                />
                <NumberRow
                  label="Minimum payout amount"
                  value={s.revenue.minimum_payout_amount}
                  min={0}
                  suffix={s.revenue.currency}
                  disabled={loading}
                  onChange={(v) => patch('revenue', { minimum_payout_amount: v })}
                />
                <TextRow
                  label="Tax label"
                  value={s.revenue.tax_label}
                  disabled={loading}
                  onChange={(v) => patch('revenue', { tax_label: v })}
                />
                <ToggleRow
                  label="Show tax line in revenue reports"
                  checked={s.revenue.show_tax_in_reports}
                  disabled={loading}
                  onChange={(v) => patch('revenue', { show_tax_in_reports: v })}
                />
                <Link
                  href="/dashboard/reports?category=revenue"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                >
                  <FileText size={16} />
                  Open revenue reports
                </Link>
              </SettingCard>
            )}

            {!loading && active === 'books' && s && (
              <SettingCard
                title="Books & editorial review"
                description="Upload limits and approval workflow defaults."
              >
                <ToggleRow
                  label="Require revenue agreement before publish"
                  checked={s.books.require_revenue_agreement}
                  disabled={loading}
                  onChange={(v) => patch('books', { require_revenue_agreement: v })}
                />
                <ToggleRow
                  label="Dual-format review (PDF + audio)"
                  checked={s.books.dual_format_review_required}
                  disabled={loading}
                  onChange={(v) => patch('books', { dual_format_review_required: v })}
                />
                <ToggleRow
                  label="Authors can update pricing after approval"
                  checked={s.books.allow_author_pricing_updates}
                  disabled={loading}
                  onChange={(v) => patch('books', { allow_author_pricing_updates: v })}
                />
                <NumberRow
                  label="Default review SLA"
                  value={s.books.default_review_sla_days}
                  min={1}
                  max={90}
                  suffix="days"
                  disabled={loading}
                  onChange={(v) => patch('books', { default_review_sla_days: v })}
                />
                <NumberRow
                  label="Max PDF upload size"
                  value={s.books.max_pdf_upload_mb}
                  min={1}
                  max={500}
                  suffix="MB"
                  disabled={loading}
                  onChange={(v) => patch('books', { max_pdf_upload_mb: v })}
                />
                <NumberRow
                  label="Max audio upload size"
                  value={s.books.max_audio_upload_mb}
                  min={1}
                  max={2000}
                  suffix="MB"
                  disabled={loading}
                  onChange={(v) => patch('books', { max_audio_upload_mb: v })}
                />
                <Link
                  href="/dashboard/books"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                >
                  <BookOpen size={16} />
                  Book review queue
                </Link>
              </SettingCard>
            )}

            {!loading && active === 'notifications' && s && (
              <SettingCard
                title="Email & in-app notifications"
                description="Controls for admin alerts (delivery depends on mail setup)."
              >
                <ToggleRow
                  label="Email on new book submission"
                  checked={s.notifications.email_on_new_submission}
                  disabled={loading}
                  onChange={(v) => patch('notifications', { email_on_new_submission: v })}
                />
                <ToggleRow
                  label="Email on completed sale"
                  checked={s.notifications.email_on_sale}
                  disabled={loading}
                  onChange={(v) => patch('notifications', { email_on_sale: v })}
                />
                <ToggleRow
                  label="Email on new user registration"
                  checked={s.notifications.email_on_user_registration}
                  disabled={loading}
                  onChange={(v) => patch('notifications', { email_on_user_registration: v })}
                />
                <ToggleRow
                  label="Email when book is rejected"
                  checked={s.notifications.email_on_book_rejected}
                  disabled={loading}
                  onChange={(v) => patch('notifications', { email_on_book_rejected: v })}
                />
                <ToggleRow
                  label="In-app notifications"
                  checked={s.notifications.in_app_notifications}
                  disabled={loading}
                  onChange={(v) => patch('notifications', { in_app_notifications: v })}
                />
                <ToggleRow
                  label="Weekly digest email"
                  checked={s.notifications.digest_email_weekly}
                  disabled={loading}
                  onChange={(v) => patch('notifications', { digest_email_weekly: v })}
                />
              </SettingCard>
            )}

            {!loading && active === 'reports' && s && (
              <SettingCard title="Reports defaults" description="Default filters and export behavior.">
                <NumberRow
                  label="Default date range"
                  value={s.reports.default_range_days}
                  min={7}
                  max={365}
                  suffix="days"
                  disabled={loading}
                  onChange={(v) => patch('reports', { default_range_days: v })}
                />
                <SelectRow
                  label="Default export format"
                  value={s.reports.default_export_format}
                  options={[
                    { value: 'xlsx', label: 'Excel (.xlsx)' },
                    { value: 'csv', label: 'CSV' },
                  ]}
                  disabled={loading}
                  onChange={(v) =>
                    patch('reports', {
                      default_export_format: v as 'csv' | 'xlsx',
                    })
                  }
                />
                <NumberRow
                  label="Auto-refresh interval"
                  hint="0 = manual refresh only on reports pages."
                  value={s.reports.auto_refresh_interval_sec}
                  min={0}
                  max={3600}
                  suffix="sec"
                  disabled={loading}
                  onChange={(v) => patch('reports', { auto_refresh_interval_sec: v })}
                />
                <ToggleRow
                  label="Show operational metrics on reports hub"
                  checked={s.reports.show_operational_metrics}
                  disabled={loading}
                  onChange={(v) => patch('reports', { show_operational_metrics: v })}
                />
                <Link
                  href="/dashboard/reports"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                >
                  <LayoutDashboard size={16} />
                  Reports center
                </Link>
              </SettingCard>
            )}

            {!loading && active === 'invitations' && s && (
              <SettingCard title="Admin & team invitations">
                <NumberRow
                  label="Default invitation expiry"
                  value={s.invitations.default_expiry_days}
                  min={1}
                  max={90}
                  suffix="days"
                  disabled={loading}
                  onChange={(v) => patch('invitations', { default_expiry_days: v })}
                />
                <NumberRow
                  label="Reminder before expiry"
                  value={s.invitations.reminder_before_expiry_days}
                  min={0}
                  max={30}
                  suffix="days"
                  disabled={loading}
                  onChange={(v) => patch('invitations', { reminder_before_expiry_days: v })}
                />
                <ToggleRow
                  label="Send invitation email immediately on create"
                  checked={s.invitations.auto_send_on_create}
                  disabled={loading}
                  onChange={(v) => patch('invitations', { auto_send_on_create: v })}
                />
              </SettingCard>
            )}

            {!loading && active === 'payments' && s && (
              <SettingCard title="Payments & refunds">
                <SelectRow
                  label="Primary payment gateway"
                  value={s.payments.primary_gateway}
                  options={[
                    { value: 'chapa', label: 'Chapa' },
                    { value: 'stripe', label: 'Stripe (if configured)' },
                    { value: 'mock', label: 'Mock / test' },
                  ]}
                  disabled={loading}
                  onChange={(v) => patch('payments', { primary_gateway: v })}
                />
                <ToggleRow
                  label="Allow mock payments (development)"
                  checked={s.payments.allow_mock_payments}
                  disabled={loading}
                  onChange={(v) => patch('payments', { allow_mock_payments: v })}
                />
                <NumberRow
                  label="Refund window"
                  value={s.payments.refund_window_days}
                  min={0}
                  max={90}
                  suffix="days"
                  disabled={loading}
                  onChange={(v) => patch('payments', { refund_window_days: v })}
                />
              </SettingCard>
            )}

            {active === 'appearance' && (
              <>
                <SettingCard
                  title="Theme"
                  description="Saved in this browser only."
                >
                  <div className="flex flex-wrap gap-2">
                    {(['light', 'dark'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        disabled={!mounted}
                        onClick={() => setTheme(t)}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition ${
                          mounted && theme === t
                            ? 'bg-primary text-white'
                            : 'border border-border bg-background text-foreground hover:bg-surface'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </SettingCard>
                <SettingCard title="Console layout" description="Stored locally on this device.">
                  <ToggleRow
                    label="Compact tables"
                    hint="Denser row spacing in list views."
                    checked={local.compactTables}
                    onChange={(v) => updateLocal({ compactTables: v })}
                  />
                  <ToggleRow
                    label="Start with sidebar collapsed"
                    checked={local.defaultSidebarCollapsed}
                    onChange={(v) => updateLocal({ defaultSidebarCollapsed: v })}
                  />
                  <ToggleRow
                    label="Show dashboard tips"
                    checked={local.showDashboardTips}
                    onChange={(v) => updateLocal({ showDashboardTips: v })}
                  />
                  <p className="text-xs text-muted">
                    Sidebar is currently {collapsed ? 'collapsed' : 'expanded'}.
                  </p>
                </SettingCard>
              </>
            )}

            {active === 'security' && (
              <>
                <SettingCard title="Security">
                  <p className="text-sm text-muted">
                    Manage password and sessions for your admin account.
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-border bg-surface/40 px-4 py-3 text-sm">
                      <p className="font-semibold text-foreground">Change Password</p>
                      <p className="mt-1 text-xs text-muted">Use Supabase auth or your profile page.</p>
                      <Link href="/dashboard/profile" className="mt-2 inline-block text-xs font-semibold text-primary hover:underline">
                        Open profile →
                      </Link>
                    </div>
                    <div className="rounded-xl border border-border bg-surface/40 px-4 py-3 text-sm">
                      <p className="font-semibold text-foreground">Two-Factor Authentication</p>
                      <p className="mt-1 text-xs text-muted">Coming soon — email OTP backup.</p>
                    </div>
                    <div className="rounded-xl border border-border bg-surface/40 px-4 py-3 text-sm">
                      <p className="font-semibold text-foreground">Login Sessions</p>
                      <p className="mt-1 text-xs text-muted">Sign out from other devices via logout.</p>
                    </div>
                  </div>
                </SettingCard>

                <SettingCard title="Destructive actions">
                  <ToggleRow
                    label="Confirm before delete / reject"
                    checked={local.confirmDestructiveActions}
                    onChange={(v) => updateLocal({ confirmDestructiveActions: v })}
                  />
                </SettingCard>
                <SettingCard title="Quick links">
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/dashboard/profile"
                      className="inline-flex items-center gap-2 rounded-lg bg-surface px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-border"
                    >
                      <User size={16} />
                      My Profile
                    </Link>
                    <Link
                      href="/dashboard/reports/settings"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                    >
                      Legacy commission page (reports)
                    </Link>
                  </div>
                </SettingCard>
              </>
            )}

            {active !== 'appearance' && active !== 'security' && (
              <SaveBar
                dirty={dirty}
                saving={saving}
                saved={saved}
                error={error}
                onSave={() => save()}
                onReset={resetDraft}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
