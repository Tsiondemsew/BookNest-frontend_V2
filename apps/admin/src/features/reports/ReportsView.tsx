'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/client';

export function ReportsView() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'reports'],
    queryFn: () => adminApi.listReports({ status: 'pending' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.updateReport(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] }),
  });

  const reports = data?.data?.reports ?? [];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Reports</h1>
      <p className="mt-1 text-sm text-zinc-500">Community content flagged by users.</p>
      <div className="mt-6 space-y-3">
        {isLoading && <p className="text-zinc-500">Loading…</p>}
        {reports.map((r) => (
          <div key={r.id} className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="font-medium capitalize">
              {r.target_type} · {r.reason}
            </p>
            <p className="mt-1 text-sm text-zinc-600">{r.details || 'No details'}</p>
            <p className="mt-1 text-xs text-zinc-400">Target ID: {r.target_id}</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className="text-sm text-green-700 hover:underline"
                onClick={() => updateMutation.mutate({ id: r.id, status: 'resolved' })}
              >
                Resolve
              </button>
              <button
                type="button"
                className="text-sm text-zinc-600 hover:underline"
                onClick={() => updateMutation.mutate({ id: r.id, status: 'dismissed' })}
              >
                Dismiss
              </button>
            </div>
          </div>
        ))}
        {!isLoading && reports.length === 0 && (
          <p className="text-zinc-500">No pending reports.</p>
        )}
      </div>
    </div>
  );
}
