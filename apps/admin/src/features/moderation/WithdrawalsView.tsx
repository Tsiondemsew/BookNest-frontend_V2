'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Wallet, ChevronRight } from 'lucide-react';
import type { AdminWithdrawalRow } from '@repo/api-client';
import { adminApi } from '@/lib/api/client';
import { AdminBadge, AdminButton, AdminCard, AdminSelect } from '@/components/ui/AdminUi';

function payoutSummary(details: unknown): string {
  if (!details || typeof details !== 'object') return '—';
  const d = details as Record<string, unknown>;
  const method = d.method ?? d.payout_method ?? d.type;
  const account = d.account_number ?? d.phone ?? d.account ?? d.email;
  const parts = [method, account].filter(Boolean).map(String);
  return parts.length ? parts.join(' · ') : JSON.stringify(details).slice(0, 60);
}

function withdrawalTone(status: string): 'neutral' | 'success' | 'warning' | 'danger' {
  if (status === 'approved') return 'success';
  if (status === 'rejected') return 'danger';
  return 'warning';
}

export function WithdrawalsView() {
  const [statusFilter, setStatusFilter] = useState('pending');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<'approved' | 'rejected' | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'withdrawals', statusFilter],
    queryFn: () =>
      adminApi.listWithdrawals({ status: statusFilter || undefined }),
  });

  const reviewMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: 'approved' | 'rejected';
    }) => adminApi.reviewWithdrawal(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      setConfirmId(null);
      setConfirmAction(null);
    },
  });

  const rows = data?.data?.withdrawals ?? [];

  const startConfirm = (id: string, action: 'approved' | 'rejected') => {
    setConfirmId(id);
    setConfirmAction(action);
  };

  return (
    <div className="max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A2A3A]">Withdrawals</h1>
          <p className="mt-1 text-sm text-[#4A5568]">
            Approve or reject seller payout requests.
          </p>
        </div>
        <AdminSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-40"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="">All</option>
        </AdminSelect>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load withdrawals.{' '}
          <button type="button" className="underline" onClick={() => void refetch()}>
            Retry
          </button>
        </div>
      )}

      {reviewMutation.isError && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not process withdrawal. Please try again.
        </div>
      )}

      <AdminCard className="mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[#FDFBF7] text-left text-[#4A5568] border-b border-[#E8E2D9]">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Payout details</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Requested</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#4A5568]">
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center">
                    <Wallet size={32} className="mx-auto text-[#E8E2D9]" />
                    <p className="mt-3 text-[#4A5568]">No withdrawal requests.</p>
                  </td>
                </tr>
              ) : (
                rows.map((w) => (
                  <tr key={w.id} className="border-t border-[#E8E2D9]">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#1A2A3A] truncate max-w-[200px]">
                        {w.user_email ?? w.user_id}
                      </p>
                      {w.user_role && (
                        <p className="text-xs text-[#4A5568] capitalize">{w.user_role}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#2C3E50] tabular-nums">
                      {Number(w.amount).toFixed(2)} {w.currency}
                    </td>
                    <td className="px-4 py-3 text-[#4A5568] text-xs max-w-[220px] truncate hidden md:table-cell">
                      {payoutSummary(w.payout_details)}
                    </td>
                    <td className="px-4 py-3">
                      <AdminBadge tone={withdrawalTone(w.status)}>{w.status}</AdminBadge>
                    </td>
                    <td className="px-4 py-3 text-[#4A5568] whitespace-nowrap hidden sm:table-cell">
                      {new Date(w.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {w.status === 'pending' ? (
                        confirmId === w.id && confirmAction ? (
                          <div className="flex flex-col gap-1.5 min-w-[140px]">
                            <p className="text-xs text-[#4A5568]">
                              {confirmAction === 'approved' ? 'Approve payout?' : 'Reject & refund?'}
                            </p>
                            <div className="flex gap-1">
                              <AdminButton
                                variant="secondary"
                                className="text-xs py-1 px-2"
                                disabled={reviewMutation.isPending}
                                onClick={() => {
                                  setConfirmId(null);
                                  setConfirmAction(null);
                                }}
                              >
                                Cancel
                              </AdminButton>
                              <AdminButton
                                variant={confirmAction === 'approved' ? 'primary' : 'danger'}
                                className="text-xs py-1 px-2"
                                disabled={reviewMutation.isPending}
                                onClick={() =>
                                  reviewMutation.mutate({ id: w.id, status: confirmAction })
                                }
                              >
                                Confirm
                              </AdminButton>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-1">
                            <AdminButton
                              variant="primary"
                              className="text-xs py-1.5 px-2.5"
                              onClick={() => startConfirm(w.id, 'approved')}
                            >
                              Approve
                            </AdminButton>
                            <AdminButton
                              variant="danger"
                              className="text-xs py-1.5 px-2.5"
                              onClick={() => startConfirm(w.id, 'rejected')}
                            >
                              Reject
                            </AdminButton>
                          </div>
                        )
                      ) : (
                        <ChevronRight size={16} className="text-[#E8E2D9]" aria-hidden />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  );
}
