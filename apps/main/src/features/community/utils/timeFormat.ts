'use client';

import { useCallback } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

export function useFormatRelativeTime() {
  const { t } = useTranslation();

  return useCallback(
    (dateString: string): string => {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);
      const diffWeek = Math.floor(diffDay / 7);
      const diffMonth = Math.floor(diffDay / 30);
      const diffYear = Math.floor(diffDay / 365);

      if (diffSec < 60) return t('community.time.justNow');
      if (diffMin < 60) return t('community.time.minutesAgo', { count: diffMin });
      if (diffHour < 24) return t('community.time.hoursAgo', { count: diffHour });
      if (diffDay < 7) return t('community.time.daysAgo', { count: diffDay });
      if (diffWeek < 4) return t('community.time.weeksAgo', { count: diffWeek });
      if (diffMonth < 12) return t('community.time.monthsAgo', { count: diffMonth });
      return t('community.time.yearsAgo', { count: diffYear });
    },
    [t]
  );
}

/** @deprecated Use useFormatRelativeTime in client components */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffWeek < 4) return `${diffWeek}w ago`;
  if (diffMonth < 12) return `${diffMonth}mo ago`;
  return `${diffYear}y ago`;
}
