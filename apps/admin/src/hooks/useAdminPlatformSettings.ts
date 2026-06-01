'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AdminPlatformSettings, AdminSettingsResponse } from '@/features/settings/types';
import { getApiErrorMessage } from '@/lib/api-error';

export function useAdminPlatformSettings() {
  const [settings, setSettings] = useState<AdminPlatformSettings | null>(null);
  const [draft, setDraft] = useState<AdminPlatformSettings | null>(null);
  const [meta, setMeta] = useState<AdminSettingsResponse['meta'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/settings', { credentials: 'include' });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(getApiErrorMessage(payload, 'Failed to load settings'));
      }
      const data = payload.data as AdminSettingsResponse;
      setSettings(data.settings);
      setDraft(data.settings);
      setMeta(data.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
      setSettings(null);
      setDraft(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSection = useCallback(
    <K extends keyof AdminPlatformSettings>(
      section: K,
      patch: Partial<AdminPlatformSettings[K]>,
    ) => {
      setDraft((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          [section]: { ...prev[section], ...patch },
        };
      });
      setSaved(false);
    },
    [],
  );

  const save = useCallback(async () => {
    if (!draft) return false;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(getApiErrorMessage(payload, 'Failed to save settings'));
      }
      const data = payload.data as AdminSettingsResponse;
      setSettings(data.settings);
      setDraft(data.settings);
      setMeta(data.meta);
      setSaved(true);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
      return false;
    } finally {
      setSaving(false);
    }
  }, [draft]);

  const resetDraft = useCallback(() => {
    if (settings) setDraft(settings);
    setSaved(false);
  }, [settings]);

  const dirty =
    draft != null && settings != null && JSON.stringify(draft) !== JSON.stringify(settings);

  useEffect(() => {
    load();
  }, [load]);

  return {
    settings,
    draft,
    meta,
    loading,
    saving,
    error,
    saved,
    dirty,
    load,
    save,
    resetDraft,
    updateSection,
  };
}
