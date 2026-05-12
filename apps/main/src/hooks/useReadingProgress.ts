'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { getLocalProgressForBook, saveProgressLocally, syncProgressToBackend } from '@/lib/progress/progressService';

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
  const maxPositionRef = useRef<number>(0);
  const hasCompletedRef = useRef<boolean>(false);
  
  // Load progress from IndexedDB on mount
  useEffect(() => {
    if (!isAuthenticated || !user || !bookFormatId) {
      setIsLoading(false);
      return;
    }
    
    const loadProgress = async () => {
      try {
        const localProgress = await getLocalProgressForBook(user.id, bookFormatId);
        if (localProgress) {
          const percent = localProgress.progressPercent;
          const position = localProgress.lastPosition;
          setProgressPercent(percent);
          setLastPosition(position);
          maxPositionRef.current = position;
          
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
  }, [isAuthenticated, user, bookFormatId, onComplete]);
  
  // Update progress - only increases, never decreases
  const updateProgress = useCallback(async (newPosition: number) => {
    if (!isAuthenticated || !user || !bookFormatId) return;
    
    // ✅ NEVER decrease progress - only update if new position is GREATER
    if (newPosition <= maxPositionRef.current) {
      console.log('Progress not updated (position not greater)', { 
        current: maxPositionRef.current, 
        new: newPosition 
      });
      return;
    }
    
    const newPercent = Math.min(100, Math.floor((newPosition / total) * 100));
    const previousPercent = progressPercent;
    
    // Update refs
    maxPositionRef.current = newPosition;
    setProgressPercent(newPercent);
    setLastPosition(newPosition);
    
    // Save to IndexedDB
    await saveProgressLocally(
      user.id,
      bookFormatId,
      newPercent,
      newPosition,
      total
    );
    
    // Check if just completed
    if (!hasCompletedRef.current && previousPercent < 100 && newPercent >= 100) {
      hasCompletedRef.current = true;
      onComplete?.();
    }
  }, [isAuthenticated, user, bookFormatId, total, progressPercent, onComplete]);
  
  return {
    progressPercent,
    lastPosition,
    isLoading,
    updateProgress,
    syncNow: syncProgressToBackend,
  };
}