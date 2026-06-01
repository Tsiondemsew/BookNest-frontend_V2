'use client';

import { CheckCircle2, Eye, Loader2, Save, Send, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/components/toast-provider';
import { getApiErrorMessage } from '@/lib/api-error';
import { PreviewInvitationModal } from './preview-invitation-modal';
import {
  applyPlaceholders,
  defaultExpiresAtIso,
  toDatetimeLocalValue,
  DEFAULT_TEMPLATES,
} from './invitation-templates';
import type { InvitationRoleType, InvitationStatus } from './types';

type CreateInvitationModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (viewStatus?: InvitationStatus) => void;
};

const ROLES: { id: InvitationRoleType; label: string }[] = [
  { id: 'user', label: 'User (Reader)' },
  { id: 'author', label: 'Author' },
  { id: 'publisher', label: 'Publisher' },
];

const FIELD_LABELS: Record<string, string> = {
  recipientName: 'Recipient name',
  recipientEmail: 'Recipient email',
  subject: 'Email subject',
  message: 'Message',
  expiresAt: 'Expiration date',
};

export function CreateInvitationModal({ open, onClose, onCreated }: CreateInvitationModalProps) {
  const { toast } = useToast();
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [roleType, setRoleType] = useState<InvitationRoleType>('user');
  const [subject, setSubject] = useState(DEFAULT_TEMPLATES.user.subject);
  const [message, setMessage] = useState(DEFAULT_TEMPLATES.user.message);
  const [expiresAt, setExpiresAt] = useState(defaultExpiresAtIso());
  const [sendImmediately, setSendImmediately] = useState(true);
  const [saving, setSaving] = useState<'draft' | 'send' | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [draftSaved, setDraftSaved] = useState<{ name: string; email: string } | null>(null);
  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (!open) return;
    const template = DEFAULT_TEMPLATES[roleType];
    setSubject(template.subject);
    setMessage(template.message);
  }, [roleType, open]);

  const reset = () => {
    setRecipientName('');
    setRecipientEmail('');
    setRoleType('user');
    setSubject(DEFAULT_TEMPLATES.user.subject);
    setMessage(DEFAULT_TEMPLATES.user.message);
    setExpiresAt(defaultExpiresAtIso());
    setSendImmediately(true);
    setFieldErrors({});
    setDraftSaved(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (recipientName.trim().length < 2) errors.recipientName = 'Name is required (min 2 characters)';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail.trim())) {
      errors.recipientEmail = 'Valid email is required';
    }
    if (subject.trim().length < 3) errors.subject = 'Subject is required';
    if (message.trim().length < 10) errors.message = 'Message must be at least 10 characters';
    if (new Date(expiresAt) <= new Date()) errors.expiresAt = 'Expiration must be in the future';
    setFieldErrors(errors);
    const firstErrorField = Object.keys(errors)[0];
    return { valid: !firstErrorField, firstErrorField, errors };
  };

  const focusField = (fieldKey: string) => {
    window.setTimeout(() => {
      const el = fieldRefs.current[fieldKey];
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if ('focus' in el && typeof el.focus === 'function') {
        el.focus({ preventScroll: true });
      }
    }, 50);
  };

  const fieldClass = (fieldKey: string) =>
    `w-full rounded-lg border px-3 py-2 text-sm dark:bg-surface ${
      fieldErrors[fieldKey]
        ? 'border-red-500 ring-2 ring-red-500/20 dark:border-red-500'
        : 'border-border'
    }`;

  const previewMessage = applyPlaceholders(message, {
    name: recipientName,
    expiresAt,
  });

  const submit = async (forceDraft = false) => {
    const { valid, firstErrorField } = validate();
    if (!valid && firstErrorField) {
      const label = FIELD_LABELS[firstErrorField] || 'This field';
      toast(`Please fill in this field: ${label}`, 'error');
      focusField(firstErrorField);
      return;
    }
    const shouldSend = !forceDraft && sendImmediately;
    setSaving(forceDraft ? 'draft' : 'send');
    try {
      const res = await fetch('/api/admin/invitations', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName: recipientName.trim(),
          recipientEmail: recipientEmail.trim(),
          roleType,
          subject: subject.trim(),
          message: message.trim(),
          expiresAt: new Date(expiresAt).toISOString(),
          sendImmediately: shouldSend,
        }),
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        const msg =
          payload.errors?.[0]?.message ||
          getApiErrorMessage(payload, 'Failed to create invitation');
        throw new Error(msg);
      }
      if (forceDraft) {
        setDraftSaved({
          name: recipientName.trim(),
          email: recipientEmail.trim(),
        });
        onCreated('draft');
        return;
      }
      toast(
        payload.data?.emailSendFailed
          ? payload.message ||
              `Invitation saved as draft. Email not sent — configure SMTP and click Send from the list.`
          : payload.message || `Invitation email sent to ${recipientEmail.trim()}`,
        payload.data?.emailSendFailed ? 'error' : 'success',
      );
      onCreated();
      handleClose();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to create invitation', 'error');
    } finally {
      setSaving(null);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close" onClick={handleClose} />
        <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card shadow-xl">
          <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-card px-6 py-4 dark:border-border dark:bg-primary">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {draftSaved ? 'Draft saved' : 'New invitation'}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {draftSaved
                  ? 'Your invitation was saved without sending email.'
                  : 'Customize the template and send to your invitee.'}
              </p>
            </div>
            <button type="button" onClick={handleClose} className="rounded-lg p-2 text-muted hover:bg-surface">
              <X size={18} />
            </button>
          </div>

          {draftSaved ? (
            <div className="px-6 py-10 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/40">
                <CheckCircle2 className="text-emerald-500" size={48} />
              </div>
              <h3 className="mt-5 text-xl font-bold text-foreground">Invitation saved as draft</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
                <span className="font-semibold text-foreground">{draftSaved.name}</span> (
                {draftSaved.email}) was saved. Open the <strong>Draft</strong> filter below to edit or send
                it later.
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
              >
                View drafts
              </button>
            </div>
          ) : (
          <div className="space-y-4 px-6 py-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">
                  Recipient name
                </label>
                <input
                  ref={(el) => {
                    fieldRefs.current.recipientName = el;
                  }}
                  value={recipientName}
                  onChange={(e) => {
                    setRecipientName(e.target.value);
                    if (fieldErrors.recipientName) {
                      setFieldErrors((prev) => {
                        const next = { ...prev };
                        delete next.recipientName;
                        return next;
                      });
                    }
                  }}
                  className={fieldClass('recipientName')}
                  placeholder="Jane Author"
                />
                {fieldErrors.recipientName && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.recipientName}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">
                  Recipient email
                </label>
                <input
                  ref={(el) => {
                    fieldRefs.current.recipientEmail = el;
                  }}
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => {
                    setRecipientEmail(e.target.value);
                    if (fieldErrors.recipientEmail) {
                      setFieldErrors((prev) => {
                        const next = { ...prev };
                        delete next.recipientEmail;
                        return next;
                      });
                    }
                  }}
                  className={fieldClass('recipientEmail')}
                  placeholder="jane@example.com"
                />
                {fieldErrors.recipientEmail && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.recipientEmail}</p>
                )}
              </div>
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
                ref={(el) => {
                  fieldRefs.current.subject = el;
                }}
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  if (fieldErrors.subject) {
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.subject;
                      return next;
                    });
                  }
                }}
                className={fieldClass('subject')}
              />
              {fieldErrors.subject && <p className="mt-1 text-xs text-red-600">{fieldErrors.subject}</p>}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">
                Message
              </label>
              <textarea
                ref={(el) => {
                  fieldRefs.current.message = el;
                }}
                rows={8}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (fieldErrors.message) {
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.message;
                      return next;
                    });
                  }
                }}
                className={`${fieldClass('message')} resize-y`}
              />
              <p className="mt-1 text-xs text-muted">Placeholders: {'{{name}}'}, {'{{expiresAt}}'}</p>
              {fieldErrors.message && <p className="mt-1 text-xs text-red-600">{fieldErrors.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">
                Expiration date
              </label>
              <input
                ref={(el) => {
                  fieldRefs.current.expiresAt = el;
                }}
                type="datetime-local"
                value={toDatetimeLocalValue(expiresAt)}
                onChange={(e) => {
                  setExpiresAt(new Date(e.target.value).toISOString());
                  if (fieldErrors.expiresAt) {
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.expiresAt;
                      return next;
                    });
                  }
                }}
                className={fieldClass('expiresAt')}
              />
              {fieldErrors.expiresAt && <p className="mt-1 text-xs text-red-600">{fieldErrors.expiresAt}</p>}
            </div>

            <label className="flex items-center gap-3 rounded-xl border border-border bg-surface/80 p-3 text-sm text-foreground dark:border-border dark:bg-surface/40 dark:text-zinc-200">
              <input
                type="checkbox"
                checked={sendImmediately}
                onChange={(e) => setSendImmediately(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-accent"
              />
              <span>
                Send invitation email to{' '}
                <span className="font-mono text-xs">
                  {recipientEmail.trim() || 'recipient@example.com'}
                </span>
              </span>
            </label>
          </div>
          )}

          {!draftSaved && (
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
              disabled={!!saving}
              onClick={() => submit(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold dark:border-border disabled:opacity-50"
            >
              {saving === 'draft' ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save as draft
            </button>
            <button
              type="button"
              disabled={!!saving || !sendImmediately}
              onClick={() => submit(false)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {saving === 'send' ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Create & send
            </button>
          </div>
          )}
        </div>
      </div>

      <PreviewInvitationModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        recipientName={recipientName || 'Guest'}
        recipientEmail={recipientEmail || 'recipient@example.com'}
        roleType={roleType}
        subject={subject}
        message={previewMessage}
        expiresAt={expiresAt}
      />
    </>
  );
}
