'use client';

import Link from 'next/link';
import { X, Flag, User, MessageSquare, ExternalLink } from 'lucide-react';
import type { AdminReportRow } from '@repo/api-client';
import { mainAppUrl } from '@/lib/mainAppUrl';
import { AdminBadge, AdminButton } from '@/components/ui/AdminUi';

type ReportReviewModalProps = {
  report: AdminReportRow;
  onClose: () => void;
  onResolve: () => void;
  onDismiss: () => void;
  isUpdating: boolean;
};

export function ReportReviewModal({
  report,
  onClose,
  onResolve,
  onDismiss,
  isUpdating,
}: ReportReviewModalProps) {
  const subject = report.subject_user;
  const reporter = report.reporter;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-[#1A2A3A]/50 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-[#E8E2D9] bg-white shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E2D9] shrink-0">
          <div className="flex items-center gap-2">
            <Flag size={18} className="text-[#B85C38]" />
            <h2 className="text-lg font-semibold text-[#1A2A3A]">Report review</h2>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-[#FDFBF7]" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto min-h-0 flex-1">
          <div className="flex flex-wrap gap-2">
            <AdminBadge tone="warning">{report.status || 'pending'}</AdminBadge>
            <span className="text-xs text-[#4A5568] capitalize">
              {report.target_type.replace('_', ' ')} · {report.reason}
            </span>
          </div>

          <dl className="rounded-xl border border-[#E8E2D9] bg-[#FDFBF7] px-3 py-2 text-sm space-y-2">
            <div className="flex gap-2">
              <dt className="text-[#4A5568] w-28 shrink-0">Reported at</dt>
              <dd className="text-[#1A2A3A]">{new Date(report.created_at).toLocaleString()}</dd>
            </div>
            <div className="flex gap-2 items-start">
              <dt className="text-[#4A5568] w-28 shrink-0 flex items-center gap-1">
                <User size={14} /> Reporter
              </dt>
              <dd className="text-[#1A2A3A]">{reporter?.email ?? 'Unknown'}</dd>
            </div>
            <div className="flex gap-2 items-start">
              <dt className="text-[#4A5568] w-28 shrink-0">Reported user</dt>
              <dd className="text-[#1A2A3A]">
                {subject?.email ?? '—'}
                {subject?.account_status && (
                  <span className="ml-2 text-xs capitalize text-[#4A5568]">
                    ({subject.account_status})
                  </span>
                )}
              </dd>
            </div>
            {report.details && (
              <div className="flex gap-2">
                <dt className="text-[#4A5568] w-28 shrink-0">Details</dt>
                <dd className="text-[#1A2A3A]">{report.details}</dd>
              </div>
            )}
          </dl>

          {report.post && (
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-[#1A2A3A] mb-2">
                <MessageSquare size={16} className="text-[#B85C38]" />
                Reported post
                {report.post.author_email && (
                  <span className="font-normal text-[#4A5568]">
                    by {report.post.author_email}
                  </span>
                )}
              </h3>
              <div className="rounded-xl border border-[#E8E2D9] bg-white p-4">
                <AdminBadge tone={report.post.status === 'published' ? 'success' : 'neutral'}>
                  {report.post.status}
                </AdminBadge>
                <p className="mt-3 text-sm text-[#1A2A3A] whitespace-pre-wrap">{report.post.content}</p>
                {report.post.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={report.post.image_url}
                    alt=""
                    className="mt-3 max-h-56 rounded-lg object-cover w-full"
                  />
                )}
                <a
                  href={`${mainAppUrl}/community?post=${report.post.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-sm text-[#B85C38] hover:underline"
                >
                  Open on main site
                  <ExternalLink size={14} />
                </a>
              </div>
            </section>
          )}
        </div>

        <div className="px-5 py-4 border-t border-[#E8E2D9] bg-[#FDFBF7] shrink-0 flex flex-wrap gap-2">
          {report.subject_user_id && (
            <Link href={`/dashboard/users/${report.subject_user_id}`}>
              <AdminButton variant="secondary" type="button">
                Manage reported user
              </AdminButton>
            </Link>
          )}
          <AdminButton variant="primary" disabled={isUpdating} onClick={onResolve} className="ml-auto">
            {isUpdating ? 'Saving…' : 'Resolve'}
          </AdminButton>
          <AdminButton variant="ghost" disabled={isUpdating} onClick={onDismiss}>
            Dismiss
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
