import type { InvitationStatus } from './types';

export const STATUS_LABELS: Record<InvitationStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  accepted: 'Accepted',
  expired: 'Expired',
};

export function canEditInvitation(status: InvitationStatus) {
  return status === 'draft' || status === 'expired';
}

export function canSendInvitation(status: InvitationStatus, sentAt: string | null) {
  return status === 'draft' && !sentAt;
}

export function canResendInvitation(status: InvitationStatus, sentAt: string | null = null) {
  if (status === 'sent' || status === 'expired') return true;
  if (status === 'draft' && sentAt) return true;
  return false;
}

export function canDeleteInvitation(_status: InvitationStatus) {
  return true;
}
