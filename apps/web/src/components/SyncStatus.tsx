'use client';

import { useSync } from '@/hooks/useSync';
import { useEffect, useState } from 'react';

export default function SyncStatus() {
  const { pendingItems, isSyncing, lastSyncTime, syncError, triggerSync } = useSync();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show sync status if there are pending items or sync error
    setIsVisible(pendingItems > 0 || !!syncError);
  }, [pendingItems, syncError]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 right-4 max-w-sm">
      <div className="rounded-lg border border-border bg-card shadow-lg p-4">
        {syncError ? (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-destructive">Sync Failed</p>
            <p className="text-xs text-foreground/70">{syncError.message}</p>
            <button
              onClick={() => triggerSync()}
              disabled={isSyncing}
              className="mt-2 text-xs px-3 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {isSyncing ? 'Retrying...' : 'Retry'}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">
                {pendingItems} pending changes
              </p>
              {isSyncing && (
                <span className="inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              )}
            </div>
            {lastSyncTime && (
              <p className="text-xs text-foreground/60">
                Last synced: {new Date(lastSyncTime).toLocaleTimeString()}
              </p>
            )}
            {!isSyncing && pendingItems > 0 && (
              <button
                onClick={() => triggerSync()}
                className="mt-2 text-xs px-3 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Sync Now
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
