'use client';

import { Check, Loader2, Pencil, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/components/toast-provider';
import { getApiErrorMessage } from '@/lib/api-error';
import { useAdminSession } from '@/hooks/useAdminSession';

import type { AdminSession } from '@/context/admin-session-context';

type AdminDisplayNameEditorProps = {
  variant?: 'card' | 'inline';
  className?: string;
};

export function AdminDisplayNameEditor({
  variant = 'card',
  className = '',
}: AdminDisplayNameEditorProps) {
  const { displayName, applySession, patchDisplayName } = useAdminSession();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(displayName);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editing) setDraft(displayName);
  }, [displayName, editing]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const cancel = () => {
    setDraft(displayName);
    setEditing(false);
  };

  const save = async () => {
    const trimmed = draft.trim();
    if (trimmed.length < 2) {
      toast('Name must be at least 2 characters', 'error');
      return;
    }
    if (trimmed === displayName.trim()) {
      setEditing(false);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/profile/name', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: trimmed, display_name: trimmed }),
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
        throw new Error(getApiErrorMessage(payload, 'Failed to update name'));
      }

      patchDisplayName(trimmed);

      if (payload.data?.user) {
        applySession({
          ...payload.data,
          user: { ...payload.data.user, publicName: trimmed },
        });
      }

      setEditing(false);
      toast('Display name updated', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to update name', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <form
        className={`flex flex-wrap items-center justify-center gap-2 ${variant === 'card' ? 'mt-5 w-full' : ''} ${className}`}
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={draft}
          maxLength={80}
          disabled={saving}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') cancel();
          }}
          className={`rounded-lg border border-accent/40 bg-card px-3 py-2 text-foreground outline-none ring-indigo-100 focus:ring-2 dark:border-accent/30 dark:bg-surface ${
            variant === 'card'
              ? 'min-w-[200px] flex-1 text-center text-lg font-bold'
              : 'min-w-[180px] text-sm'
          }`}
          aria-label="Display name"
        />
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          Save name
        </button>
        <button
          type="button"
          onClick={cancel}
          disabled={saving}
          className="rounded-lg border border-border px-3 py-2 text-sm text-muted hover:bg-surface dark:border-border dark:text-muted"
        >
          Cancel
        </button>
      </form>
    );
  }

  if (variant === 'card') {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className={`group mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg px-2 py-1 transition hover:bg-surface dark:hover:bg-primary/90 ${className}`}
        aria-label="Edit display name"
      >
        <span className="text-xl font-bold text-foreground">{displayName}</span>
        <Pencil
          size={14}
          className="text-muted opacity-0 transition group-hover:opacity-100"
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={`group inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 font-medium text-foreground transition hover:bg-surface dark:hover:bg-primary/90 ${className}`}
      aria-label="Edit display name"
    >
      {displayName}
      <Pencil size={12} className="text-muted opacity-0 transition group-hover:opacity-100" />
    </button>
  );
}
