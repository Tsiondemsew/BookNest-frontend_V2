'use client';

import { useState, type MouseEvent } from 'react';
import { approveButtonSmClass } from './moderation-button-styles';
import type { ChangeDecisionStatus } from './types';

function DecisionBadge({ status }: { status: ChangeDecisionStatus }) {
  if (status === 'approved') {
    return (
      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
        Approved
      </span>
    );
  }
  if (status === 'rejected') {
    return (
      <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-800 dark:bg-red-900/50 dark:text-red-200">
        Rejected
      </span>
    );
  }
  return (
    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
      Pending review
    </span>
  );
}

export function ChangeItemModerationBar({
  changeId,
  status = 'pending',
  approving = false,
  rejecting = false,
  disabled = false,
  approveLabel = 'Approve change',
  rejectLabel = 'Reject change',
  onApprove,
  onReject,
}: {
  changeId: string;
  status?: ChangeDecisionStatus;
  approving?: boolean;
  rejecting?: boolean;
  disabled?: boolean;
  approveLabel?: string;
  rejectLabel?: string;
  onApprove?: () => void | Promise<void>;
  onReject?: () => void | Promise<void>;
}) {
  const [pressed, setPressed] = useState<'approve' | 'reject' | null>(null);

  if (!onApprove && !onReject) return null;

  const run =
    (action: 'approve' | 'reject', fn?: () => void | Promise<void>) =>
    (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!fn || disabled) return;
      if (action === 'approve' && approving) return;
      if (action === 'reject' && rejecting) return;
      setPressed(action);
      void Promise.resolve(fn())
        .catch(() => {
          /* parent hook shows toast */
        })
        .finally(() => setPressed(null));
    };

  const btnBase =
    'inline-flex min-h-[44px] flex-1 select-none touch-manipulation items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-150 sm:flex-none sm:min-w-[7.5rem]';

  return (
    <div
      className="relative z-10 mt-4 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4 dark:border-slate-700"
      data-change-id={changeId}
      role="group"
      aria-label={`Actions for ${changeId}`}
    >
      <DecisionBadge status={status} />
      {onApprove && (
        <button
          type="button"
          disabled={disabled || approving}
          onClick={run('approve', onApprove)}
          aria-busy={approving}
          className={`${btnBase} ${approveButtonSmClass} active:scale-[0.97] ${
            status === 'approved' ? 'ring-2 ring-emerald-300' : ''
          } ${pressed === 'approve' ? 'scale-[0.97] ring-2 ring-emerald-400 ring-offset-1' : ''} ${
            approving ? 'opacity-90' : ''
          }`}
        >
          {approving && (
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
              aria-hidden
            />
          )}
          {approving ? 'Approving change…' : status === 'approved' ? 'Approved ✓' : approveLabel}
        </button>
      )}
      {onReject && (
        <button
          type="button"
          disabled={disabled || rejecting}
          onClick={run('reject', onReject)}
          aria-busy={rejecting}
          className={`${btnBase} cursor-pointer border-2 border-red-300 bg-white text-red-600 hover:border-red-400 hover:bg-red-50 hover:shadow-sm active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-800 dark:bg-transparent dark:hover:bg-red-950/40 ${
            status === 'rejected' ? 'border-red-500 bg-red-50 ring-2 ring-red-300 dark:bg-red-950/40' : ''
          } ${pressed === 'reject' ? 'scale-[0.97] ring-2 ring-red-400 ring-offset-1' : ''} ${
            rejecting ? 'opacity-90' : ''
          }`}
        >
          {rejecting && (
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-red-300 border-t-red-600"
              aria-hidden
            />
          )}
          {rejecting ? 'Rejecting change…' : status === 'rejected' ? 'Rejected ✓' : rejectLabel}
        </button>
      )}
    </div>
  );
}
