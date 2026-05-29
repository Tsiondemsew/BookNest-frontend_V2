'use client';

import { CheckCircle2, Clock, UserCheck, UserX } from 'lucide-react';
import type { UserVerificationStatus } from './types';

const LABELS: Record<UserVerificationStatus, string> = {
  verified: 'Verified',
  pending: 'Pending',
  registered: 'Registered',
  inactive: 'Inactive',
};

export function VerificationBadge({ status }: { status: UserVerificationStatus }) {
  if (status === 'verified') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
        <CheckCircle2 size={14} />
        {LABELS.verified}
      </span>
    );
  }

  if (status === 'registered') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-200 dark:bg-sky-950/40 dark:text-sky-300">
        <UserCheck size={14} />
        {LABELS.registered}
      </span>
    );
  }

  if (status === 'inactive') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-400">
        <UserX size={14} />
        {LABELS.inactive}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300">
      <Clock size={14} />
      {LABELS.pending}
    </span>
  );
}

export function verificationLabel(status: UserVerificationStatus) {
  return LABELS[status];
}
