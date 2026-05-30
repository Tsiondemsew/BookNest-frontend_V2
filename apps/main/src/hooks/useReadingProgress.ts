'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import {
  getLocalProgressForBook,
  saveProgressLocally,
  syncProgressToBackend,
  mergeProgressFromServer,
} from '@/lib/progress/progressService';

interface SessionMeta {
  trackMode?: 'pages' | 'minutes';
  pagesDelta?: number;
  minutesDelta?: number;
  forcePositionSave?: boolean;
}

interface UseReadingProgressOptions {
  bookFormatId: string;
  total: number;
  onComplete?: () => void;
}

export function useReadingProgress({ bookFormatId, total, onComplete }: UseReadingProgressOptions) {
  const { user, isAuthenticated } = useAuthStore();
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [lastPosition, setLastPosition] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  /** Furthest playback point in seconds — completion % never goes down for audio. */
  const furthestPositionRef = useRef<number>(0);
  const progressPercentRef = useRef<number>(0);
  const hasCompletedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isAuthenticated || !user || !bookFormatId) {
      setIsLoading(false);
      return;
    }

    const loadProgress = async () => {
      try {
        await mergeProgressFromServer(user.id);
        const localProgress = await getLocalProgressForBook(user.id, bookFormatId);
        if (localProgress) {
          const percent = localProgress.progressPercent;
          const position = localProgress.lastPosition;
          const furthestFromPercent =
            total > 0
              ? percent >= 100
                ? total
                : Math.ceil((percent / 100) * total)
              : position;
          const furthest = Math.max(position, furthestFromPercent);
          progressPercentRef.current = percent;
          setProgressPercent(percent);
          setLastPosition(position);
          furthestPositionRef.current = furthest;

          if (percent >= 100) {
            hasCompletedRef.current = true;
            onComplete?.();
          }
        }
      } catch (error) {
        console.error('Failed to load progress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [isAuthenticated, user, bookFormatId, total, onComplete]);

  const updateProgress = useCallback(
    async (newPosition: number, sessionMeta?: SessionMeta) => {
      if (!isAuthenticated || !user || !bookFormatId) return;

      const trackMode = sessionMeta?.trackMode ?? 'pages';
      const isAudio = trackMode === 'minutes';
      const bookmarkPosition = newPosition;

      // Furthest point reached in the book — completion % never decreases (PDF or audio).
      const furthestPosition = Math.max(furthestPositionRef.current, newPosition);
      const computedPercent =
        total > 0 ? Math.min(100, Math.floor((furthestPosition / total) * 100)) : 0;
      const newPercent = Math.max(progressPercentRef.current, computedPercent);
      const previousPercent = progressPercentRef.current;

      const forwardDelta = Math.max(0, newPosition - furthestPositionRef.current);
      const pagesDelta = trackMode === 'minutes' ? 0 : (sessionMeta?.pagesDelta ?? forwardDelta);
      const minutesDelta =
        trackMode === 'minutes' ? (sessionMeta?.minutesDelta ?? 0) : (sessionMeta?.minutesDelta ?? 0);

      const bookmarkOnly =
        !isAudio &&
        newPosition < furthestPositionRef.current &&
        Boolean(sessionMeta?.forcePositionSave);

      if (
        !bookmarkOnly &&
        !isAudio &&
        forwardDelta <= 0 &&
        !sessionMeta?.forcePositionSave
      ) {
        return;
      }

      if (
        isAudio &&
        forwardDelta <= 0 &&
        !sessionMeta?.minutesDelta &&
        !sessionMeta?.forcePositionSave
      ) {
        return;
      }

      furthestPositionRef.current = furthestPosition;
      progressPercentRef.current = newPercent;
      setProgressPercent(newPercent);
      setLastPosition(bookmarkPosition);

      const hasActivity =
        pagesDelta > 0 ||
        minutesDelta > 0 ||
        newPercent !== previousPercent ||
        Boolean(sessionMeta?.forcePositionSave);

      if (!hasActivity) return;

      await saveProgressLocally(
        user.id,
        bookFormatId,
        newPercent,
        bookmarkPosition,
        total,
        {
          pagesDelta: pagesDelta > 0 ? pagesDelta : 0,
          minutesDelta: minutesDelta > 0 ? minutesDelta : 0,
        }
      ).catch((err) => {
        console.warn('Could not save reading progress locally', err);
      });

      if (!hasCompletedRef.current && previousPercent < 100 && newPercent >= 100) {
        hasCompletedRef.current = true;
        onComplete?.();
      }
    },
    [isAuthenticated, user, bookFormatId, total, onComplete]
  );

  useEffect(() => {
    const flush = () => {
      if (navigator.onLine) void syncProgressToBackend();
    };
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flush();
    });
    return () => {
      window.removeEventListener('pagehide', flush);
    };
  }, []);

  return {
    progressPercent,
    lastPosition,
    isLoading,
    updateProgress,
    syncNow: syncProgressToBackend,
  };
}
