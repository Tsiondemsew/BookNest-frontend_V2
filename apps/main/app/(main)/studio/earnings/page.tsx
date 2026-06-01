'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sellerFinanceApi } from '@/lib/api/client';
import {
  Loader2,
  DollarSign,
  TrendingDown,
  Wallet,
  Receipt,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import {
  validateWithdrawalForm,
  type WithdrawalFormErrors,
  type WithdrawalFormValues,
} from '@/features/studio/validateWithdrawal';

const inputClass = (hasError: boolean) =>
  `w-full px-3.5 py-2.5 rounded-xl border bg-white text-[#1A2A3A] placeholder:text-[#4A5568]/60 focus:outline-none focus:ring-2 focus:ring-[#B85C38]/20 transition-colors ${
    hasError ? 'border-red-400 focus:border-red-400' : 'border-[#E8E2D9] focus:border-[#B85C38]'
  }`;

const EMPTY_FORM: WithdrawalFormValues = {
  amount: '',
  accountName: '',
  bankName: '',
  accountNumber: '',
  mobileMoney: '',
};

export default function StudioEarningsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const isPublisher = user?.role === 'publisher';
  const [form, setForm] = useState<WithdrawalFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<WithdrawalFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const { data: summaryRes, isLoading: summaryLoading } = useQuery({
    queryKey: ['seller', 'earnings', 'summary'],
    queryFn: () => sellerFinanceApi.getEarningsSummary(),
  });

  const { data: earningsRes } = useQuery({
    queryKey: ['seller', 'earnings'],
    queryFn: () => sellerFinanceApi.getEarnings(),
  });

  const { data: withdrawalsRes } = useQuery({
    queryKey: ['seller', 'withdrawals'],
    queryFn: () => sellerFinanceApi.getWithdrawals(),
  });

  const summary = summaryRes?.data;
  const earnings = earningsRes?.data || [];
  const withdrawals = withdrawalsRes?.data || [];
  const currency = summary?.currency || 'ETB';
  const feePercent = summary?.platform_fee_percent ?? 15;
  const availableBalance = Number(summary?.available_balance || 0);

  const withdrawMutation = useMutation({
    mutationFn: () =>
      sellerFinanceApi.requestWithdrawal({
        amount: parseFloat(form.amount.trim()),
        payout_details: {
          account_name: form.accountName.trim(),
          bank_name: form.bankName.trim() || undefined,
          account_number: form.accountNumber.trim() || undefined,
          mobile_money: form.mobileMoney.trim() || undefined,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller'] });
      setForm(EMPTY_FORM);
      setErrors({});
      setSubmitError(null);
      setSubmitSuccess(true);
    },
    onError: (e: Error) => setSubmitError(e.message || t('studioPayouts.withdrawFailed')),
  });

  const updateField = (field: keyof WithdrawalFormValues, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      if (field === 'bankName' || field === 'accountNumber' || field === 'mobileMoney') {
        delete next.payoutMethod;
      }
      delete next.form;
      return next;
    });
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validateWithdrawalForm(form, availableBalance, currency, t);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    withdrawMutation.mutate();
  };

  const withdrawalStatusLabel = useMemo(
    () =>
      ({
        pending: t('studioPayouts.statusPending'),
        approved: t('studioPayouts.statusApproved'),
        rejected: t('studioPayouts.statusRejected'),
        completed: t('studioPayouts.statusCompleted'),
      }) as Record<string, string>,
    [t]
  );

  if (summaryLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-[#B85C38]" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <Link
            href="/studio/analytics"
            className="inline-flex items-center gap-1.5 text-sm text-[#B85C38] hover:underline mb-3"
          >
            <ArrowLeft size={16} />
            {t('studioPayouts.linkAnalytics')}
          </Link>
          <h1 className="text-2xl font-bold text-[#1A2A3A] bn-serif">
            {isPublisher ? t('studioPayouts.titlePayouts') : t('studioPayouts.titleEarnings')}
          </h1>
          <p className="text-[#4A5568] mt-1">{t('studioPayouts.subtitle', { fee: feePercent })}</p>
        </div>
      </div>

      <div className="rounded-xl bg-[#FDFBF7] border border-[#E8E2D9] px-4 py-3 text-sm text-[#4A5568] leading-relaxed">
        {isPublisher ? t('studioPayouts.compareNote') : t('studioPayouts.compareNoteAuthor')}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={Receipt}
          label={t('studioPayouts.grossSales')}
          sub={t('studioPayouts.grossSalesSub')}
          value={`${Number(summary?.gross_sales || 0).toFixed(2)} ${currency}`}
        />
        <SummaryCard
          icon={TrendingDown}
          label={t('studioPayouts.platformFee', { fee: feePercent })}
          sub={t('studioPayouts.platformFeeSub')}
          value={`−${Number(summary?.platform_fees || 0).toFixed(2)} ${currency}`}
          accent="#8E735B"
        />
        <SummaryCard
          icon={DollarSign}
          label={t('studioPayouts.netEarnings')}
          sub={t('studioPayouts.salesRecorded', { count: summary?.sale_count ?? 0 })}
          value={`${Number(summary?.net_earnings || 0).toFixed(2)} ${currency}`}
          accent="#2D6A4F"
        />
        <SummaryCard
          icon={Wallet}
          label={t('studioPayouts.availableWithdraw')}
          sub={
            Number(summary?.pending_withdrawal || 0) > 0
              ? t('studioPayouts.pendingAmount', {
                  amount: Number(summary?.pending_withdrawal).toFixed(2),
                })
              : t('studioPayouts.readyForPayout')
          }
          value={`${availableBalance.toFixed(2)} ${currency}`}
          accent="#B85C38"
          highlight
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <section className="lg:col-span-2 bg-white border border-[#E8E2D9] rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-[#1A2A3A] text-lg mb-1">
            {t('studioPayouts.requestWithdrawal')}
          </h2>
          <p className="text-sm text-[#4A5568] mb-5">{t('studioPayouts.payoutDetailsHint')}</p>

          {submitSuccess && (
            <div className="mb-4 flex items-start gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2.5 text-sm text-emerald-800">
              <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
              {t('studioPayouts.withdrawSuccess')}
            </div>
          )}

          {submitError && (
            <div className="mb-4 flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              {submitError}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <Field
              id="withdraw-amount"
              label={t('studioPayouts.amountLabel')}
              hint={t('studioPayouts.maxAvailable', {
                amount: availableBalance.toFixed(2),
                currency,
              })}
              error={errors.amount}
            >
              <input
                id="withdraw-amount"
                type="text"
                inputMode="decimal"
                placeholder={t('studioPayouts.amountPlaceholder', { currency })}
                value={form.amount}
                onChange={(e) => updateField('amount', e.target.value.replace(/[^\d.]/g, ''))}
                className={inputClass(Boolean(errors.amount))}
                aria-invalid={Boolean(errors.amount)}
              />
            </Field>

            <Field
              id="withdraw-account-name"
              label={t('studioPayouts.accountHolderLabel')}
              error={errors.accountName}
            >
              <input
                id="withdraw-account-name"
                value={form.accountName}
                onChange={(e) => updateField('accountName', e.target.value)}
                className={inputClass(Boolean(errors.accountName))}
                aria-invalid={Boolean(errors.accountName)}
              />
            </Field>

            <div className="rounded-xl border border-[#E8E2D9] bg-[#FDFBF7]/60 p-4 space-y-4">
              <p className="text-sm font-medium text-[#1A2A3A]">{t('studioPayouts.payoutDetails')}</p>
              {errors.payoutMethod && (
                <p className="text-xs text-red-600">{errors.payoutMethod}</p>
              )}

              <Field
                id="withdraw-bank"
                label={t('studioPayouts.bankNameLabel')}
                error={errors.bankName}
              >
                <input
                  id="withdraw-bank"
                  value={form.bankName}
                  onChange={(e) => updateField('bankName', e.target.value)}
                  className={inputClass(Boolean(errors.bankName))}
                />
              </Field>

              <Field
                id="withdraw-account-number"
                label={t('studioPayouts.accountNumberLabel')}
                error={errors.accountNumber}
              >
                <input
                  id="withdraw-account-number"
                  value={form.accountNumber}
                  onChange={(e) => updateField('accountNumber', e.target.value)}
                  className={inputClass(Boolean(errors.accountNumber))}
                />
              </Field>

              <Field
                id="withdraw-mobile"
                label={t('studioPayouts.mobileMoneyLabel')}
                error={errors.mobileMoney}
              >
                <input
                  id="withdraw-mobile"
                  value={form.mobileMoney}
                  onChange={(e) => updateField('mobileMoney', e.target.value)}
                  className={inputClass(Boolean(errors.mobileMoney))}
                />
              </Field>
            </div>

            <button
              type="submit"
              disabled={withdrawMutation.isPending || availableBalance <= 0}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#B85C38] text-white rounded-xl font-semibold hover:bg-[#A04E2F] disabled:opacity-50 transition-colors"
            >
              {withdrawMutation.isPending && <Loader2 size={18} className="animate-spin" />}
              {withdrawMutation.isPending
                ? t('studioPayouts.submitting')
                : t('studioPayouts.requestBtn')}
            </button>
          </form>
        </section>

        <div className="lg:col-span-3 space-y-6">
          <section className="bg-white border border-[#E8E2D9] rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-[#1A2A3A] mb-1">{t('studioPayouts.earningsLedger')}</h2>
            <p className="text-xs text-[#4A5568] mb-4">{t('studioPayouts.ledgerNote')}</p>
            <ul className="space-y-3 text-sm max-h-80 overflow-y-auto bn-scrollbar">
              {earnings.slice(0, 15).map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-xl border border-[#E8E2D9]/80 px-4 py-3 hover:bg-[#FDFBF7] transition-colors"
                >
                  <div className="flex justify-between gap-4">
                    <span className="font-medium text-[#1A2A3A] line-clamp-1">
                      {entry.book_format?.book?.title || t('studioPayouts.saleFallback')}
                    </span>
                    <span className="text-[#2D6A4F] font-semibold shrink-0 tabular-nums">
                      +{Number(entry.net_amount).toFixed(2)} {currency}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 text-xs text-[#4A5568] mt-1.5">
                    <span>
                      {t('studioPayouts.gross')} {Number(entry.gross_amount).toFixed(2)}
                    </span>
                    <span>
                      {t('studioPayouts.fee')} −{Number(entry.platform_fee).toFixed(2)}
                    </span>
                    <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                  </div>
                </li>
              ))}
              {!earnings.length && (
                <p className="text-[#4A5568] text-sm py-6 text-center">
                  {t('studioPayouts.noEarningsYet')}
                </p>
              )}
            </ul>
          </section>

          <section className="bg-white border border-[#E8E2D9] rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-[#1A2A3A] mb-4">
              {t('studioPayouts.withdrawalHistory')}
            </h2>
            <ul className="space-y-2 text-sm">
              {withdrawals.map((w) => (
                <li
                  key={w.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[#E8E2D9]/80 px-4 py-3"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <WithdrawalStatusIcon status={w.status} />
                    <span className="font-medium text-[#1A2A3A] tabular-nums">
                      {Number(w.amount).toFixed(2)} {w.currency}
                    </span>
                    <span className="text-xs text-[#4A5568] capitalize truncate">
                      {withdrawalStatusLabel[w.status] || w.status}
                    </span>
                  </div>
                  <span className="text-xs text-[#4A5568] shrink-0">
                    {new Date(w.created_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
              {!withdrawals.length && (
                <p className="text-[#4A5568] py-4 text-center">{t('studioPayouts.noWithdrawalsYet')}</p>
              )}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-[#1A2A3A] mb-1.5">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-[#4A5568] mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

function WithdrawalStatusIcon({ status }: { status: string }) {
  if (status === 'completed' || status === 'approved') {
    return <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />;
  }
  if (status === 'rejected') {
    return <XCircle size={16} className="text-red-500 shrink-0" />;
  }
  return <Clock size={16} className="text-amber-600 shrink-0" />;
}

function SummaryCard({
  icon: Icon,
  label,
  sub,
  value,
  accent = '#2C3E50',
  highlight,
}: {
  icon: typeof DollarSign;
  label: string;
  sub: string;
  value: string;
  accent?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm transition-shadow hover:shadow-md ${
        highlight ? 'border-[#B85C38]/30 bg-[#B85C38]/5' : 'border-[#E8E2D9] bg-white'
      }`}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
        style={{ backgroundColor: `${accent}14` }}
      >
        <Icon size={20} style={{ color: accent }} />
      </div>
      <p className="text-xl font-bold text-[#1A2A3A] tabular-nums">{value}</p>
      <p className="text-sm font-medium text-[#1A2A3A] mt-1">{label}</p>
      <p className="text-xs text-[#4A5568] mt-0.5">{sub}</p>
    </div>
  );
}
