'use client';

import { WifiOff } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export function OfflinePageNotice({ label }: { label?: string }) {
  const { t } = useTranslation();
  if (typeof navigator !== 'undefined' && navigator.onLine) return null;

  const text = label ?? t('offline.pageNoticeDefault');

  return (
    <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <WifiOff size={16} className="shrink-0" />
      <span>{t('offline.pageNotice', { label: text })}</span>
    </div>
  );
}
