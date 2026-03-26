'use client';

import React, { useEffect, useState } from 'react';
import { useServiceWorker } from '@/hooks/useServiceWorker';

/**
 * OfflineNotification - Shows offline status and update prompts
 * 
 * Displays when:
 * - User goes offline
 * - Service worker update is available
 */
export function OfflineNotification() {
  const { isOnline, hasUpdate, handleUpdate } = useServiceWorker();
  const [showOffline, setShowOffline] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    setShowOffline(!isOnline);
  }, [isOnline]);

  useEffect(() => {
    setShowUpdate(hasUpdate);
  }, [hasUpdate]);

  if (!showOffline && !showUpdate) return null;

  if (showUpdate) {
    return (
      <div
        className="fixed bottom-0 left-0 right-0 bg-primary text-white p-4 flex items-center justify-between"
        role="status"
        aria-live="polite"
      >
        <p className="text-sm">A new version of BookNest is available.</p>
        <div className="flex gap-2">
          <button
            onClick={() => setShowUpdate(false)}
            className="text-sm underline hover:no-underline"
            aria-label="Dismiss update notification"
          >
            Not now
          </button>
          <button
            onClick={() => {
              handleUpdate();
              setShowUpdate(false);
            }}
            className="text-sm font-semibold hover:opacity-90"
            aria-label="Update to new version"
          >
            Update now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-accent text-white p-4 flex items-center gap-2"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse" />
      <p className="text-sm flex-1">
        You&apos;re currently offline. Some features may be limited.
      </p>
      <button
        onClick={() => setShowOffline(false)}
        className="text-sm underline hover:no-underline"
        aria-label="Dismiss offline notification"
      >
        Dismiss
      </button>
    </div>
  );
}
