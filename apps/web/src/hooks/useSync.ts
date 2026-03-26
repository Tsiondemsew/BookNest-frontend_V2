'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { syncAllPending, startBackgroundSync } from '@/lib/sync';
import { getSyncQueue } from '@/lib/db';

interface SyncState {
  isSyncing: boolean;
  pendingItems: number;
  lastSyncTime: number | null;
  syncError: Error | null;
}

export function useSync() {
  const [state, setState] = useState<SyncState>({
    isSyncing: false,
    pendingItems: 0,
    lastSyncTime: null,
    syncError: null,
  });

  const cleanupRef = useRef<(() => void) | null>(null);

  // Get pending sync items count
  const getPendingCount = useCallback(async () => {
    try {
      const queue = await getSyncQueue();
      setState((prev) => ({ ...prev, pendingItems: queue.length }));
    } catch (error) {
      console.error('[Sync] Failed to get pending count:', error);
    }
  }, []);

  // Manual sync trigger
  const triggerSync = useCallback(async () => {
    setState((prev) => ({ ...prev, isSyncing: true, syncError: null }));

    try {
      const result = await syncAllPending();
      setState((prev) => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: Date.now(),
        pendingItems: result.results.filter((r) => !r.success).length,
      }));

      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Sync failed');
      setState((prev) => ({
        ...prev,
        isSyncing: false,
        syncError: err,
      }));
      throw err;
    }
  }, []);

  // Initialize background sync on mount
  useEffect(() => {
    getPendingCount();

    // Start background sync
    cleanupRef.current = startBackgroundSync((results: any) => {
      getPendingCount();
      console.log('[Sync] Background sync completed:', results);
    });

    // Sync when coming back online
    const handleOnline = () => {
      console.log('[Sync] Connection restored, syncing...');
      triggerSync();
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
      cleanupRef.current?.();
    };
  }, [getPendingCount, triggerSync]);

  return {
    ...state,
    triggerSync,
    getPendingCount,
  };
}
