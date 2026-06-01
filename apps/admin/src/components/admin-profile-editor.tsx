'use client';

import { Loader2, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/toast-provider';
import { getApiErrorMessage } from '@/lib/api-error';
import { useAdminSession } from '@/hooks/useAdminSession';

import type { AdminSession } from '@/context/admin-session-context';

const BIO_MAX = 100;

export function AdminProfileEditor() {
  const { displayName, bio, avatarUrl, applySession, patchProfile } = useAdminSession();
  const { toast } = useToast();
  const [nameDraft, setNameDraft] = useState(displayName);
  const [bioDraft, setBioDraft] = useState(bio);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNameDraft(displayName);
    setBioDraft(bio);
  }, [displayName, bio]);

  const save = async () => {
    const trimmedName = nameDraft.trim();
    const trimmedBio = bioDraft.trim();

    if (trimmedName.length < 2) {
      toast('Name must be at least 2 characters', 'error');
      return;
    }

    if (trimmedBio.length > BIO_MAX) {
      toast(`Bio must be ${BIO_MAX} characters or less`, 'error');
      return;
    }

    const nameChanged = trimmedName !== displayName.trim();
    const bioChanged = trimmedBio !== (bio || '').trim();

    if (!nameChanged && !bioChanged) {
      toast('No changes to save', 'info');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: trimmedName,
          display_name: trimmedName,
          bio: trimmedBio || null,
        }),
      });

      let payload: {
        success?: boolean;
        data?: AdminSession;
        error?: { message?: string };
        message?: string;
      } = {};
      try {
        payload = await res.json();
      } catch {
        payload = {};
      }

      if (!res.ok || !payload.success) {
        throw new Error(getApiErrorMessage(payload, 'Failed to save profile'));
      }

      const savedBio = trimmedBio || null;
      patchProfile(trimmedName, savedBio);

      if (payload.data?.user) {
        const fromApi = payload.data.user;
        applySession({
          ...payload.data,
          user: {
            ...fromApi,
            publicName: trimmedName,
            bio: savedBio,
            avatarUrl: fromApi.avatarUrl ?? avatarUrl ?? null,
          },
        });
      }

      toast('Profile saved', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to save profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-6 space-y-4 text-left">
      <div>
        <label
          htmlFor="admin-display-name"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted"
        >
          Display name
        </label>
        <input
          id="admin-display-name"
          type="text"
          value={nameDraft}
          maxLength={80}
          disabled={saving}
          onChange={(e) => setNameDraft(e.target.value)}
          className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-medium text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent dark:border-border dark:bg-surface"
          placeholder="Your name"
        />
      </div>

      <div>
        <label
          htmlFor="admin-bio"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted"
        >
          Bio
        </label>
        <textarea
          id="admin-bio"
          value={bioDraft}
          maxLength={BIO_MAX}
          rows={4}
          disabled={saving}
          onChange={(e) => setBioDraft(e.target.value.slice(0, BIO_MAX))}
          className="w-full resize-y rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent dark:border-border dark:bg-surface"
          placeholder="A short note about you (optional)"
        />
        <p className="mt-1 text-right text-xs text-muted">
          {bioDraft.length}/{BIO_MAX}
        </p>
      </div>

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        Save changes
      </button>
    </div>
  );
}
