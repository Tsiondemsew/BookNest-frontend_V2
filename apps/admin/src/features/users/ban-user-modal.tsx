'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export function BanUserModal({
  open,
  userName,
  userRole,
  onClose,
  onConfirm,
  loading,
}: {
  open: boolean;
  userName: string;
  userRole: string;
  onClose: () => void;
  onConfirm: (reason: string) => void | Promise<void>;
  loading: boolean;
}) {
  const [reason, setReason] = useState('');
  const requiresReason = userRole === 'author';
  const reasonValid = !requiresReason || reason.trim().length >= 5;

  useEffect(() => {
    if (!open) setReason('');
  }, [open]);

  if (!open) return null;

  const title =
    userRole === 'reader' ? 'Ban reader' : userRole === 'publisher' ? 'Ban publisher' : 'Ban author';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/50" aria-label="Close" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{title}</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Restrict access for <strong>{userName}</strong>
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100">
            <X size={18} />
          </button>
        </div>

        <label className="mt-5 block text-xs font-bold uppercase tracking-wider text-zinc-500">
          Ban reason{requiresReason ? ' *' : ' (optional)'}
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={requiresReason ? 4 : 3}
          placeholder={
            requiresReason
              ? 'Explain why this author account is being suspended…'
              : 'Optional note for internal records…'
          }
          className="mt-2 w-full rounded-xl border border-zinc-200 p-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 dark:border-zinc-700 dark:bg-zinc-800"
        />
        {requiresReason && (
          <p className="mt-1 text-xs text-zinc-500">Minimum 5 characters required for authors.</p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading || !reasonValid}
            onClick={() => onConfirm(reason.trim())}
            className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Banning…' : 'Confirm ban'}
          </button>
        </div>
      </div>
    </div>
  );
}
