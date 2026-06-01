import type { InvitationRoleType, InvitationStatus } from './types';
import { STATUS_LABELS } from './invitation-actions';

const STATUS_STYLES: Record<InvitationStatus, string> = {
  draft: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
  sent: 'bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300',
  accepted: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
  expired: 'bg-border text-muted dark:bg-surface dark:text-muted',
};

const ROLE_STYLES: Record<InvitationRoleType, string> = {
  user: 'bg-violet-100 text-violet-800 dark:bg-violet-950/50 dark:text-violet-300',
  author: 'bg-indigo-100 text-indigo-800 dark:bg-surface dark:text-accent',
  publisher: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950/50 dark:text-fuchsia-300',
};

export function StatusBadge({ status }: { status: InvitationStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function RoleBadge({ roleType }: { roleType: InvitationRoleType }) {
  const label = roleType === 'user' ? 'User' : roleType.charAt(0).toUpperCase() + roleType.slice(1);
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${ROLE_STYLES[roleType]}`}
    >
      {label}
    </span>
  );
}
