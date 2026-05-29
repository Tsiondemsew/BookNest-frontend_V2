'use client';

import { Check, Loader2, Pencil, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/components/toast-provider';
import { getApiErrorMessage } from '@/lib/api-error';
import { useAdminSession } from '@/hooks/useAdminSession';

import type { AdminSession } from '@/context/admin-session-context';

type AdminDisplayNameEditorProps = {
  variant?: 'card' | 'row';
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
    if (trimmed === displayName) {
      setEditing(false);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PATCH',
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

      const savedName = payload.data?.user?.publicName?.trim() || trimmed;
      if (payload.data?.user) {
        applySession(payload.data);
      } else {
        patchDisplayName(savedName);
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
      <div className={`flex items-center gap-2 ${className}`}>
        <input
          ref={inputRef}
          type="text"
          value={draft}
          maxLength={80}
          disabled={saving}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') cancel();
          }}
          className={`rounded-lg border border-indigo-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-indigo-100 focus:ring-2 dark:border-indigo-700 dark:bg-zinc-800 dark:text-white ${
            variant === 'card'
              ? 'w-full text-center text-lg font-bold'
              : 'min-w-[180px] text-sm'
          }`}
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            aria-label="Save name"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            Save name
          </button>
          <button
            type="button"
            onClick={cancel}
            disabled={saving}
            className="rounded-lg border border-zinc-200 p-2 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300"
            aria-label="Cancel"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className={`group mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg px-2 py-1 transition hover:bg-zinc-100 dark:hover:bg-zinc-800 ${className}`}
        aria-label="Edit display name"
      >
        <span className="text-xl font-bold text-zinc-900 dark:text-white">{displayName}</span>
        <Pencil
          size={14}
          className="text-zinc-400 opacity-0 transition group-hover:opacity-100"
        />
        <span className="sr-only">Click to edit and save your name</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={`group inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 font-medium text-zinc-900 transition hover:bg-zinc-100 dark:text-white dark:hover:bg-zinc-800 ${className}`}
      aria-label="Edit display name"
    >
      {displayName}
      <Pencil size={12} className="text-zinc-400 opacity-0 transition group-hover:opacity-100" />
    </button>
  );
}
