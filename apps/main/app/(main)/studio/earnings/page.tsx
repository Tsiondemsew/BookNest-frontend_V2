'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analyticsApi, sellerFinanceApi } from '@/lib/api/client';
import { Loader2, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function StudioEarningsPage() {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [accountName, setAccountName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [mobileMoney, setMobileMoney] = useState('');

  const { data: walletRes, isLoading: walletLoading } = useQuery({
    queryKey: ['seller', 'wallet'],
    queryFn: () => sellerFinanceApi.getWallet(),
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

  const wallet = walletRes?.data;
  const earnings = earningsRes?.data || [];
  const withdrawals = withdrawalsRes?.data || [];

  if (walletLoading) {
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
          <p className="text-[#4A5568]">Wallet balance and withdrawal requests</p>
        </div>
        <Link href="/studio/analytics" className="text-sm text-[#B85C38] hover:underline">
          ← Analytics
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E8E2D9] rounded-xl p-5">
          <DollarSign className="text-[#B85C38] mb-2" />
          <p className="text-2xl font-bold">{Number(wallet?.available_balance || 0).toFixed(2)}</p>
          <p className="text-xs text-[#4A5568]">Available ({wallet?.currency || 'ETB'})</p>
        </div>
        <div className="bg-white border border-[#E8E2D9] rounded-xl p-5">
          <p className="text-2xl font-bold">{Number(wallet?.pending_balance || 0).toFixed(2)}</p>
          <p className="text-xs text-[#4A5568]">Pending withdrawal</p>
        </div>
        <div className="bg-white border border-[#E8E2D9] rounded-xl p-5">
          <p className="text-2xl font-bold">{earnings.length}</p>
          <p className="text-xs text-[#4A5568]">Earning records</p>
        </div>
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
            placeholder="Amount (ETB)"
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
        <h2 className="font-semibold mb-4">Recent earnings</h2>
        <ul className="space-y-2 text-sm">
          {earnings.slice(0, 10).map((e) => (
            <li key={e.id} className="flex justify-between border-b pb-2">
              <span>{e.book_format?.book?.title || 'Sale'}</span>
              <span className="text-[#4A5568]">
                +{Number(e.net_amount).toFixed(2)} ETB · {new Date(e.created_at).toLocaleDateString()}
              </span>
            </li>
          ))}
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
