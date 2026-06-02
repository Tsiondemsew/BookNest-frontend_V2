'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/client';

export function WithdrawalsView() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'withdrawals'],
    queryFn: () => adminApi.listWithdrawals({ status: 'pending' }),
  });

  const reviewMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: 'approved' | 'rejected';
    }) => adminApi.reviewWithdrawal(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'withdrawals'] }),
  });

  const rows = data?.data?.withdrawals ?? [];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Withdrawal requests</h1>
      <div className="mt-6 space-y-3">
        {isLoading && <p className="text-zinc-500">Loading…</p>}
        {rows.map((w) => (
          <div
            key={w.id}
            className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium">
                {w.amount} {w.currency}
              </p>
              <p className="text-xs text-zinc-500">User: {w.user_id}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-lg bg-green-700 px-3 py-1.5 text-sm text-white"
                onClick={() => reviewMutation.mutate({ id: w.id, status: 'approved' })}
              >
                Approve
              </button>
              <button
                type="button"
                className="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white"
                onClick={() => reviewMutation.mutate({ id: w.id, status: 'rejected' })}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
        {!isLoading && rows.length === 0 && (
          <p className="text-zinc-500">No pending withdrawals.</p>
        )}
      </div>
    </div>
  );
}
