'use client';

import { X } from 'lucide-react';
import { RoleBadge } from './invitation-badges';
import type { InvitationRoleType } from './types';

type PreviewInvitationModalProps = {
  open: boolean;
  onClose: () => void;
  recipientName: string;
  recipientEmail: string;
  roleType: InvitationRoleType;
  subject: string;
  message: string;
  expiresAt: string;
};

export function PreviewInvitationModal({
  open,
  onClose,
  recipientName,
  recipientEmail,
  roleType,
  subject,
  message,
  expiresAt,
}: PreviewInvitationModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl dark:border-border dark:bg-primary">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Email preview</h2>
            <p className="mt-1 text-sm text-muted">How the invitation will appear to the recipient.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-muted hover:bg-surface">
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 space-y-3 rounded-xl border border-border bg-surface p-4 text-sm dark:border-border dark:bg-surface/50">
          <div className="flex flex-wrap gap-2">
            <RoleBadge roleType={roleType} />
            <span className="text-muted">To: {recipientEmail}</span>
          </div>
          <p className="font-semibold text-foreground">{subject}</p>
          <p className="whitespace-pre-wrap text-muted">{message}</p>
          <p className="text-xs text-muted">
            Expires: {new Date(expiresAt).toLocaleString()} · Greeting: Hello {recipientName}
          </p>
          <div className="rounded-lg bg-primary px-4 py-2 text-center text-sm font-semibold text-white">
            Accept invitation
          </div>
        </div>
      </div>
    </div>
  );
}
