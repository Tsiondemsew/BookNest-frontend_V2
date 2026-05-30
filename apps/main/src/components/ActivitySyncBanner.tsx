'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CloudOff, RefreshCw } from 'lucide-react';
import {
  getActivitySyncStatus,
  onActivitySyncStatus,
  flushReadingActivity,
  type ActivitySyncStatus,
} from '@/lib/reading/recordActivity';

export function ActivitySyncBanner() {
  const [status, setStatus] = useState<ActivitySyncStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    const sync = getActivitySyncStatus();
    setStatus(sync.status);
    setError(sync.error);
    setPendingTotal(sync.pendingTotal);

    return onActivitySyncStatus((nextStatus, nextError) => {
      const next = getActivitySyncStatus();
      setStatus(nextStatus);
      setError(nextError);
      setPendingTotal(next.pendingTotal);
    });
  }, []);

  const handleRetry = async () => {
    setRetrying(true);
    await flushReadingActivity();
    setRetrying(false);
  };

  if (status === 'idle' || (status === 'synced' && pendingTotal === 0)) return null;

  const isPending = status === 'pending' || pendingTotal > 0;
  const isError = status === 'error';

  return (
    <div
      className={`rounded-xl border px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 ${
        isError
          ? 'bg-red-50 border-red-200 text-red-800'
          : 'bg-amber-50 border-amber-200 text-amber-900'
      }`}
    >
      <div className="flex items-start gap-2 flex-1">
        {isError ? <AlertCircle size={18} className="shrink-0 mt-0.5" /> : <CloudOff size={18} className="shrink-0 mt-0.5" />}
        <div>
          <p className="text-sm font-medium">
            {isError
              ? 'Reading stats could not sync'
              : 'Reading stats will update when you are back online'}
          </p>
          <p className="text-xs mt-0.5 opacity-90">
            {isError
              ? error ?? 'Check your connection and try again.'
              : pendingTotal > 0
                ? `${pendingTotal} pending activity units queued locally.`
                : 'Your recent reading is saved on this device.'}
          </p>
        </div>
      </div>
      {(isError || isPending) && navigator.onLine && (
        <button
          type="button"
          onClick={() => void handleRetry()}
          disabled={retrying}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/80 border border-current/20 text-sm font-medium shrink-0 disabled:opacity-60"
        >
          <RefreshCw size={14} className={retrying ? 'animate-spin' : ''} />
          Sync now
        </button>
      )}
    </div>
  );
}
