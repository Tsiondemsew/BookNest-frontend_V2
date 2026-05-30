'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sellerFinanceApi } from '@/lib/api/client';
import { Loader2, DollarSign, TrendingDown, Wallet, Receipt } from 'lucide-react';
import Link from 'next/link';

export default function StudioEarningsPage() {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [accountName, setAccountName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [mobileMoney, setMobileMoney] = useState('');

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

  const withdrawMutation = useMutation({
    mutationFn: () =>
      sellerFinanceApi.requestWithdrawal({
        amount: parseFloat(amount),
        payout_details: {
          account_name: accountName,
          bank_name: bankName || undefined,
          account_number: accountNumber || undefined,
          mobile_money: mobileMoney || undefined,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller'] });
      setAmount('');
      alert('Withdrawal request submitted. You will receive an email update.');
    },
    onError: (e: Error) => alert(e.message || 'Withdrawal failed'),
  });

  const summary = summaryRes?.data;
  const earnings = earningsRes?.data || [];
  const withdrawals = withdrawalsRes?.data || [];
  const currency = summary?.currency || 'ETB';

  if (summaryLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-[#B85C38]" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2A3A]">Earnings</h1>
          <p className="text-[#4A5568]">
            What you earn after BookNest&apos;s {summary?.platform_fee_percent ?? 15}% platform fee
          </p>
        </div>
        <Link href="/studio/analytics" className="text-sm text-[#B85C38] hover:underline">
          ← Sales analytics
        </Link>
      </div>

      <div className="rounded-xl bg-[#FDFBF7] border border-[#E8E2D9] px-4 py-3 text-sm text-[#4A5568]">
        <strong className="text-[#1A2A3A]">Analytics vs Earnings:</strong> Sales analytics shows{' '}
        <em>gross</em> buyer payments. This page shows your <em>net</em> share after the platform
        fee — that is what lands in your wallet.
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={Receipt}
          label="Gross sales"
          sub="Total buyers paid"
          value={`${Number(summary?.gross_sales || 0).toFixed(2)} ${currency}`}
        />
        <SummaryCard
          icon={TrendingDown}
          label={`Platform fee (${summary?.platform_fee_percent ?? 15}%)`}
          sub="BookNest service charge"
          value={`−${Number(summary?.platform_fees || 0).toFixed(2)} ${currency}`}
          accent="#8E735B"
        />
        <SummaryCard
          icon={DollarSign}
          label="Your net earnings"
          sub={`${summary?.sale_count ?? 0} sale(s) recorded`}
          value={`${Number(summary?.net_earnings || 0).toFixed(2)} ${currency}`}
          accent="#2D6A4F"
        />
        <SummaryCard
          icon={Wallet}
          label="Available to withdraw"
          sub={
            Number(summary?.pending_withdrawal || 0) > 0
              ? `${Number(summary?.pending_withdrawal).toFixed(2)} pending`
              : 'Ready for payout'
          }
          value={`${Number(summary?.available_balance || 0).toFixed(2)} ${currency}`}
          accent="#B85C38"
        />
      </div>

      <div className="bg-white border border-[#E8E2D9] rounded-xl p-6">
        <h2 className="font-semibold mb-4">Request withdrawal</h2>
        <form
          className="space-y-3 max-w-md"
          onSubmit={(e) => {
            e.preventDefault();
            withdrawMutation.mutate();
          }}
        >
          <input
            type="number"
            step="0.01"
            placeholder={`Amount (${currency})`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
          <input
            placeholder="Account holder name"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
          <input
            placeholder="Bank name (optional)"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
          <input
            placeholder="Account number (optional)"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
          <input
            placeholder="Mobile money (optional)"
            value={mobileMoney}
            onChange={(e) => setMobileMoney(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />
          <button
            type="submit"
            disabled={withdrawMutation.isPending}
            className="px-4 py-2 bg-[#B85C38] text-white rounded-lg disabled:opacity-50"
          >
            {withdrawMutation.isPending ? 'Submitting...' : 'Request withdrawal'}
          </button>
        </form>
      </div>

      <div className="bg-white border border-[#E8E2D9] rounded-xl p-6">
        <h2 className="font-semibold mb-4">Earnings ledger</h2>
        <p className="text-xs text-[#4A5568] mb-4">
          Each row is one sale: gross → platform fee → your net credit.
        </p>
        <ul className="space-y-3 text-sm">
          {earnings.slice(0, 15).map((e) => (
            <li key={e.id} className="border-b border-[#E8E2D9] pb-3">
              <div className="flex justify-between gap-4">
                <span className="font-medium text-[#1A2A3A]">
                  {e.book_format?.book?.title || 'Sale'}
                </span>
                <span className="text-[#2D6A4F] font-semibold shrink-0">
                  +{Number(e.net_amount).toFixed(2)} {currency}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-4 text-xs text-[#4A5568] mt-1">
                <span>Gross {Number(e.gross_amount).toFixed(2)}</span>
                <span>Fee −{Number(e.platform_fee).toFixed(2)}</span>
                <span>{new Date(e.created_at).toLocaleDateString()}</span>
              </div>
            </li>
          ))}
          {!earnings.length && (
            <p className="text-[#4A5568]">No earnings yet — sales appear here after checkout completes.</p>
          )}
        </ul>
      </div>

      <div className="bg-white border border-[#E8E2D9] rounded-xl p-6">
        <h2 className="font-semibold mb-4">Withdrawal history</h2>
        <ul className="space-y-2 text-sm">
          {withdrawals.map((w) => (
            <li key={w.id} className="flex justify-between border-b pb-2">
              <span>
                {Number(w.amount).toFixed(2)} {w.currency} —{' '}
                <span className="capitalize">{w.status}</span>
              </span>
              <span className="text-[#4A5568]">{new Date(w.created_at).toLocaleDateString()}</span>
            </li>
          ))}
          {!withdrawals.length && <p className="text-[#4A5568]">No withdrawals yet.</p>}
        </ul>
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  sub,
  value,
  accent = '#2C3E50',
}: {
  icon: typeof DollarSign;
  label: string;
  sub: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="bg-white border border-[#E8E2D9] rounded-xl p-5">
      <Icon className="mb-2" size={20} style={{ color: accent }} />
      <p className="text-xl font-bold text-[#1A2A3A] tabular-nums">{value}</p>
      <p className="text-sm font-medium text-[#1A2A3A] mt-1">{label}</p>
      <p className="text-xs text-[#4A5568]">{sub}</p>
    </div>
  );
}
