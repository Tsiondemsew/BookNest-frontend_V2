'use client';

import { useEffect, useState } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import {
  getNotificationPermission,
  isPushSupported,
  subscribeToStreakPush,
  unsubscribeFromStreakPush,
} from '@/lib/notifications/subscribePush';

interface StreakPushPromptProps {
  streak: number;
  pushEnabled?: boolean;
  compact?: boolean;
}

export function StreakPushPrompt({ streak, pushEnabled = true, compact = false }: StreakPushPromptProps) {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setPermission(getNotificationPermission());
  }, []);

  if (!isPushSupported() || !pushEnabled || streak < 1) return null;
  if (permission === 'granted') return null;

  const handleEnable = async () => {
    setBusy(true);
    setMessage(null);
    const result = await subscribeToStreakPush();
    setBusy(false);
    if (result.ok) {
      setPermission('granted');
    } else {
      setMessage(result.error ?? 'Could not enable notifications');
    }
  };

  const handleDismiss = async () => {
    setPermission('denied');
    await unsubscribeFromStreakPush();
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => void handleEnable()}
        disabled={busy || permission === 'denied'}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/90 text-sm transition-colors disabled:opacity-50"
      >
        {busy ? <Loader2 size={16} className="animate-spin" /> : <Bell size={16} />}
        {permission === 'denied' ? 'Notifications blocked' : 'Enable streak reminders'}
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-[#E8E2D9] bg-[#FFF8F3] p-4 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex items-start gap-3 flex-1">
        <div className="w-10 h-10 rounded-xl bg-[#B85C38]/15 flex items-center justify-center shrink-0">
          <Bell size={20} className="text-[#B85C38]" />
        </div>
        <div>
          <p className="font-medium text-[#1A2A3A]">Daily streak reminders</p>
          <p className="text-sm text-[#4A5568] mt-0.5">
            Get a gentle nudge in the evening if you have not read or listened yet — keep your{' '}
            {streak}-day streak alive.
          </p>
          {message && <p className="text-sm text-red-600 mt-2">{message}</p>}
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        {permission !== 'denied' && (
          <button
            type="button"
            onClick={() => void handleEnable()}
            disabled={busy}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#B85C38] hover:bg-[#A04E2F] text-white text-sm font-semibold disabled:opacity-60"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Bell size={16} />}
            Enable
          </button>
        )}
        <button
          type="button"
          onClick={() => void handleDismiss()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E8E2D9] text-[#4A5568] text-sm hover:bg-white"
        >
          <BellOff size={16} />
          Not now
        </button>
      </div>
    </div>
  );
}
