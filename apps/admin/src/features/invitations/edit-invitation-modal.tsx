'use client';

import { Eye, Loader2, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/toast-provider';
import { getApiErrorMessage } from '@/lib/api-error';
import { PreviewInvitationModal } from './preview-invitation-modal';
import {
  applyPlaceholders,
  toDatetimeLocalValue,
} from './invitation-templates';
import type { AdminInvitation, InvitationRoleType } from './types';

type EditInvitationModalProps = {
  invitation: AdminInvitation | null;
  onClose: () => void;
  onSaved: () => void;
};

const ROLES: { id: InvitationRoleType; label: string }[] = [
  { id: 'user', label: 'User (Reader)' },
  { id: 'author', label: 'Author' },
  { id: 'publisher', label: 'Publisher' },
];

export function EditInvitationModal({ invitation, onClose, onSaved }: EditInvitationModalProps) {
  const { toast } = useToast();
  const open = !!invitation;
  const [recipientName, setRecipientName] = useState('');
  const [roleType, setRoleType] = useState<InvitationRoleType>('user');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!invitation) return;
    setRecipientName(invitation.recipientName);
    setRoleType(invitation.roleType);
    setSubject(invitation.subject);
    setMessage(invitation.message);
    setExpiresAt(invitation.expiresAt);
    setFieldErrors({});
  }, [invitation]);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (recipientName.trim().length < 2) errors.recipientName = 'Name is required (min 2 characters)';
    if (subject.trim().length < 3) errors.subject = 'Subject is required';
    if (message.trim().length < 10) errors.message = 'Message must be at least 10 characters';
    if (new Date(expiresAt) <= new Date()) errors.expiresAt = 'Expiration must be in the future';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const previewMessage = applyPlaceholders(message, {
    name: recipientName,
    expiresAt,
  });

  const submit = async () => {
    if (!invitation || !validate()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/invitations/${invitation.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName: recipientName.trim(),
          roleType,
          subject: subject.trim(),
          message: message.trim(),
          expiresAt: new Date(expiresAt).toISOString(),
        }),
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(getApiErrorMessage(payload, 'Failed to update invitation'));
      }
      toast('Invitation updated', 'success');
      onSaved();
      onClose();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to update invitation', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!open || !invitation) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close" onClick={onClose} />
        <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card shadow-xl">
          <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-card px-6 py-4 dark:border-border dark:bg-primary">
            <div>
              <h2 className="text-lg font-bold text-foreground">Edit invitation</h2>
              <p className="mt-1 text-sm text-muted">{invitation.recipientEmail}</p>
            </div>
            <button type="button" onClick={onClose} className="rounded-lg p-2 text-muted hover:bg-surface">
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4 px-6 py-5">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">
                Recipient name
              </label>
              <input
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm dark:border-border dark:bg-surface"
              />
              {fieldErrors.recipientName && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.recipientName}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">
                Invitation type
              </label>
              <div className="flex flex-wrap gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRoleType(r.id)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                      roleType === r.id
                        ? 'bg-primary text-white'
                        : 'border border-border text-muted hover:bg-surface dark:border-border'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">
                Email subject
              </label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm dark:border-border dark:bg-surface"
              />
              {fieldErrors.subject && <p className="mt-1 text-xs text-red-600">{fieldErrors.subject}</p>}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">
                Message
              </label>
              <textarea
                rows={8}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full resize-y rounded-lg border border-border px-3 py-2 text-sm dark:border-border dark:bg-surface"
              />
              {fieldErrors.message && <p className="mt-1 text-xs text-red-600">{fieldErrors.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">
                Expiration date
              </label>
              <input
                type="datetime-local"
                value={toDatetimeLocalValue(expiresAt)}
                onChange={(e) => setExpiresAt(new Date(e.target.value).toISOString())}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm dark:border-border dark:bg-surface"
              />
              {fieldErrors.expiresAt && <p className="mt-1 text-xs text-red-600">{fieldErrors.expiresAt}</p>}
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3 border-t border-border px-6 py-4 dark:border-border">
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold dark:border-border"
            >
              <Eye size={16} />
              Preview
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2 text-sm font-semibold dark:border-border"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={submit}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save changes
            </button>
          </div>
        </div>
      </div>

      <PreviewInvitationModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        recipientName={recipientName || invitation.recipientName}
        recipientEmail={invitation.recipientEmail}
        roleType={roleType}
        subject={subject}
        message={previewMessage}
        expiresAt={expiresAt}
      />
    </>
  );
}
