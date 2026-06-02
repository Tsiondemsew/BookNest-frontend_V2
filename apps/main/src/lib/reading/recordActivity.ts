import { gamificationApi } from '@/lib/api/client';
import { isOfflineQueueProcessing } from '@/lib/offline/offlineSyncState';

type ActivityDelta = {
  pages?: number;
  minutes?: number;
  seconds?: number;
};

export type ActivitySyncStatus = 'idle' | 'pending' | 'synced' | 'error';

const PERSIST_KEY = 'booknest:pending_reading_activity';

let pending = { pages: 0, minutes: 0, seconds: 0 };
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let flushPromise: Promise<void> | null = null;
let hydrated = false;
let syncStatus: ActivitySyncStatus = 'idle';
let lastSyncError: string | null = null;

const listeners = new Set<() => void>();
const statusListeners = new Set<(status: ActivitySyncStatus, error: string | null) => void>();

function hydratePendingFromStorage() {
  if (hydrated || typeof window === 'undefined') return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(PERSIST_KEY);
    if (!raw) return;
    const stored = JSON.parse(raw) as ActivityDelta;
    pending.pages += stored.pages || 0;
    pending.minutes += stored.minutes || 0;
    pending.seconds += stored.seconds || 0;
    if (pending.pages || pending.minutes || pending.seconds) {
      setSyncStatus('pending');
    }
  } catch {
    localStorage.removeItem(PERSIST_KEY);
  }
}

function persistPendingToStorage() {
  if (typeof window === 'undefined') return;
  if (pending.pages || pending.minutes || pending.seconds) {
    localStorage.setItem(PERSIST_KEY, JSON.stringify(pending));
  } else {
    localStorage.removeItem(PERSIST_KEY);
  }
}

function setSyncStatus(status: ActivitySyncStatus, error: string | null = null) {
  syncStatus = status;
  lastSyncError = error;
  statusListeners.forEach((cb) => cb(status, error));
}

export function getActivitySyncStatus(): { status: ActivitySyncStatus; error: string | null; pendingTotal: number } {
  hydratePendingFromStorage();
  return {
    status: syncStatus,
    error: lastSyncError,
    pendingTotal: (pending.pages || 0) + (pending.minutes || 0) + (pending.seconds || 0),
  };
}

export function onActivitySyncStatus(
  cb: (status: ActivitySyncStatus, error: string | null) => void
): () => void {
  statusListeners.add(cb);
  cb(syncStatus, lastSyncError);
  return () => {
    statusListeners.delete(cb);
  };
}

export function onReadingActivityRecorded(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function notifyRecorded() {
  listeners.forEach((cb) => cb());
}

export function peekPendingActivity(): ActivityDelta | null {
  hydratePendingFromStorage();
  if (!pending.pages && !pending.minutes && !pending.seconds) return null;
  return {
    pages: pending.pages || 0,
    minutes: pending.minutes || 0,
    seconds: pending.seconds || 0,
  };
}

export function clearPendingActivity(): void {
  pending = { pages: 0, minutes: 0, seconds: 0 };
  persistPendingToStorage();
  setSyncStatus('synced');
}

export function queueReadingActivity(delta: ActivityDelta) {
  hydratePendingFromStorage();
  pending.pages = (pending.pages || 0) + (delta.pages || 0);
  pending.minutes = (pending.minutes || 0) + (delta.minutes || 0);
  pending.seconds = (pending.seconds || 0) + (delta.seconds || 0);
  persistPendingToStorage();
  setSyncStatus('pending');

  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(() => {
    void flushReadingActivity();
  }, 1500);
}

export async function flushReadingActivity(): Promise<void> {
  hydratePendingFromStorage();
  if (flushPromise) return flushPromise;

  flushPromise = (async () => {
    if (flushTimer) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }

    const pages = pending.pages || 0;
    const minutes = pending.minutes || 0;
    const seconds = pending.seconds || 0;

    if (pages === 0 && minutes === 0 && seconds === 0) {
      flushPromise = null;
      return;
    }

    pending = { pages: 0, minutes: 0, seconds: 0 };
    persistPendingToStorage();

    if (!navigator.onLine) {
      pending.pages += pages;
      pending.minutes += minutes;
      pending.seconds += seconds;
      persistPendingToStorage();
      setSyncStatus('pending');
      flushPromise = null;
      return;
    }

    if (isOfflineQueueProcessing()) {
      pending.pages += pages;
      pending.minutes += minutes;
      pending.seconds += seconds;
      persistPendingToStorage();
      setSyncStatus('pending');
      flushPromise = null;
      return;
    }

    try {
      await gamificationApi.recordActivity({
        pages_delta: pages,
        minutes_delta: minutes,
        seconds_delta: seconds,
      });
      setSyncStatus('synced');
      notifyRecorded();
    } catch (error) {
      pending.pages += pages;
      pending.minutes += minutes;
      pending.seconds += seconds;
      persistPendingToStorage();
      const message = error instanceof Error ? error.message : 'Failed to sync reading stats';
      setSyncStatus('error', message);
      console.warn('Failed to record reading activity', error);
    } finally {
      flushPromise = null;
    }
  })();

  return flushPromise;
}

export function recordPageRead(count = 1) {
  if (count <= 0) return;
  queueReadingActivity({ pages: count });
}

export function recordListeningSeconds(seconds: number) {
  if (seconds <= 0) return;
  queueReadingActivity({ seconds: Math.floor(seconds) });
}

if (typeof window !== 'undefined') {
  hydratePendingFromStorage();
  if (navigator.onLine) {
    void flushReadingActivity();
  }

  window.addEventListener('pagehide', () => {
    persistPendingToStorage();
    void flushReadingActivity();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      persistPendingToStorage();
      void flushReadingActivity();
    } else if (document.visibilityState === 'visible' && navigator.onLine) {
      void flushReadingActivity();
    }
  });
}
