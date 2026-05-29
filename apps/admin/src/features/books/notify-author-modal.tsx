'use client';

import { useEffect, useState } from 'react';
import type { RejectPayload } from './types';

export function NotifyAuthorModal({
  open,
  bookTitle,
  initialReason = '',
  initialAdminNotes = '',
  initialSuggestedFixes = '',
  initialSeverity = 'medium' as RejectPayload['severity'],
  onClose,
  onConfirm,
  loading,
}: {
  open: boolean;
  bookTitle: string;
  authorName?: string | null;
  authorEmail?: string | null;
  initialReason?: string;
  initialAdminNotes?: string;
  initialSuggestedFixes?: string;
  initialSeverity?: RejectPayload['severity'];
  onClose: () => void;
  onConfirm: (payload: RejectPayload) => void | Promise<void>;
  loading: boolean;
}) {
  const [reason, setReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [suggestedFixes, setSuggestedFixes] = useState('');
  const [severity, setSeverity] = useState<RejectPayload['severity']>('medium');

  const reasonValid = reason.trim().length >= 5;

  useEffect(() => {
    if (!open) return;
    setReason(initialReason);
    setAdminNotes(initialAdminNotes);
    setSuggestedFixes(initialSuggestedFixes);
    setSeverity(initialSeverity);
  }, [open, initialReason, initialAdminNotes, initialSuggestedFixes, initialSeverity]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Notify author</h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          <strong>{bookTitle}</strong>
        </p>

        <label className="mt-4 block text-xs font-semibold uppercase text-slate-500">
          Rejection reason *
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-600 dark:bg-slate-800"
          placeholder="Message sent to the author…"
        />

        <label className="mt-3 block text-xs font-semibold uppercase text-slate-500">
          Admin notes
        </label>
        <textarea
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-600 dark:bg-slate-800"
        />

        <label className="mt-3 block text-xs font-semibold uppercase text-slate-500">
          Suggested fixes
        </label>
        <textarea
          value={suggestedFixes}
          onChange={(e) => setSuggestedFixes(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-600 dark:bg-slate-800"
        />

        <label className="mt-3 block text-xs font-semibold uppercase text-slate-500">
          Severity
        </label>
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value as RejectPayload['severity'])}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
        >
          <option value="low">Low — minor issues</option>
          <option value="medium">Medium — needs revision</option>
          <option value="high">High — significant problems</option>
        </select>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium dark:border-slate-600"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading || !reasonValid}
            onClick={() =>
              void onConfirm({
                reason: reason.trim(),
                adminNotes: adminNotes.trim() || undefined,
                suggestedFixes: suggestedFixes.trim() || undefined,
                severity,
              })
            }
            className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading ? 'Sending…' : 'Notify author'}
          </button>
        </div>
      </div>
    </div>
  );
}
