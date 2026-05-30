'use client';

import { useEffect, useRef, useCallback } from 'react';
import { recordListeningSeconds, flushReadingActivity } from '@/lib/reading/recordActivity';

/**
 * Tracks wall-clock listening time while audio is playing (accurate vs seek position).
 */
export function useListeningTracker(isPlaying: boolean) {
  const playStartedAtRef = useRef<number | null>(null);
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const flushElapsed = useCallback(() => {
    if (playStartedAtRef.current == null) return;
    const elapsedSec = Math.floor((Date.now() - playStartedAtRef.current) / 1000);
    playStartedAtRef.current = null;
    if (elapsedSec > 0) {
      recordListeningSeconds(elapsedSec);
    }
  }, []);

  useEffect(() => {
    if (isPlaying) {
      playStartedAtRef.current = Date.now();
      tickIntervalRef.current = setInterval(() => {
        if (playStartedAtRef.current == null) return;
        const elapsedSec = Math.floor((Date.now() - playStartedAtRef.current) / 1000);
        if (elapsedSec >= 10) {
          recordListeningSeconds(elapsedSec);
          playStartedAtRef.current = Date.now();
        }
      }, 10000);
    } else {
      flushElapsed();
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = null;
      }
    }

    return () => {
      flushElapsed();
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = null;
      }
    };
  }, [isPlaying, flushElapsed]);

  useEffect(() => {
    return () => {
      flushElapsed();
      void flushReadingActivity();
    };
  }, [flushElapsed]);
}
