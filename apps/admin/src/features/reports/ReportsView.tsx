'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronRight, Flag } from 'lucide-react';
import type { AdminReportRow } from '@repo/api-client';
import { adminApi } from '@/lib/api/client';
import { AdminBadge, AdminCard, AdminSelect } from '@/components/ui/AdminUi';
import { ReportReviewModal } from './ReportReviewModal';

function reportStatusTone(status: string | null): 'neutral' | 'success' | 'warning' | 'danger' {
  if (status === 'resolved') return 'success';
  if (status === 'dismissed') return 'neutral';
  return 'warning';
}

export function ReportsView() {
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedReport, setSelectedReport] = useState<AdminReportRow | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'reports', statusFilter],
    queryFn: () =>
      adminApi.listReports({ status: statusFilter || undefined }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.updateReport(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      setSelectedReport(null);
    },
  });

  const reports = data?.data?.reports ?? [];

  return (
    <div className="max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A2A3A]">Reports</h1>
          <p className="mt-1 text-sm text-[#4A5568]">
            Review flagged posts and users. See who reported whom.
          </p>
        </div>
        <AdminSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-40"
        >
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
          <option value="">All</option>
        </AdminSelect>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load reports.{' '}
          <button type="button" className="underline" onClick={() => void refetch()}>
            Retry
          </button>
        </div>
      )}

      <AdminCard className="mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[#FDFBF7] text-left text-[#4A5568] border-b border-[#E8E2D9]">
              <tr>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Reason</th>
                <th className="px-4 py-3 font-medium">Reporter</th>
                <th className="px-4 py-3 font-medium">Reported user</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Preview</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Date</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-[#4A5568]">
                    Loading…
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center">
                    <Flag size={32} className="mx-auto text-[#E8E2D9]" />
                    <p className="mt-3 text-[#4A5568]">No reports in this filter.</p>
                  </td>
                </tr>
              ) : (
                reports.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setSelectedReport(r)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedReport(r);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    className={`border-t border-[#E8E2D9] cursor-pointer hover:bg-[#FDFBF7]/80 transition-colors ${
                      selectedReport?.id === r.id ? 'bg-[#B85C38]/5' : ''
                    }`}
                  >
                    <td className="px-4 py-3 capitalize text-[#1A2A3A]">
                      {r.target_type.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3 text-[#1A2A3A] capitalize">{r.reason}</td>
                    <td className="px-4 py-3 text-[#4A5568] max-w-[160px] truncate">
                      {r.reporter?.email ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-[#1A2A3A] max-w-[160px] truncate">
                      {r.subject_user?.email ?? r.post?.author_email ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-[#4A5568] max-w-[200px] truncate hidden md:table-cell">
                      {r.post?.content ?? r.details ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <AdminBadge tone={reportStatusTone(r.status)}>
                        {r.status || 'pending'}
                      </AdminBadge>
                    </td>
                    <td className="px-4 py-3 text-[#4A5568] whitespace-nowrap hidden sm:table-cell">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-[#B85C38]">
                      <ChevronRight size={18} aria-hidden />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>

      {selectedReport && (
        <ReportReviewModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onResolve={() => updateMutation.mutate({ id: selectedReport.id, status: 'resolved' })}
          onDismiss={() => updateMutation.mutate({ id: selectedReport.id, status: 'dismissed' })}
          isUpdating={updateMutation.isPending}
        />
      )}
    </div>
  );
}
