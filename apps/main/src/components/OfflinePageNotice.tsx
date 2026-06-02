'use client';

import { useEffect, useState } from 'react';
import { WifiOff, X } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import {
  clearOfflineNoticeDismiss,
  dismissOfflineNotice,
  isOfflineNoticeDismissed,
} from '@/lib/offline/offlineNoticeDismiss';

export function OfflinePageNotice({ label }: { label?: string }) {
  const { t } = useTranslation();
  const [online, setOnline] = useState(true);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const sync = () => {
      const isOnline = navigator.onLine;
      setOnline(isOnline);
      if (isOnline) {
        clearOfflineNoticeDismiss();
        setDismissed(false);
      } else {
        setDismissed(isOfflineNoticeDismissed());
      }
    };
    sync();
    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);
    return () => {
      window.removeEventListener('online', sync);
      window.removeEventListener('offline', sync);
    };
  }, []);

  if (online || dismissed) return null;

  const text = label ?? t('offline.pageNoticeDefault');

  return (
    <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <WifiOff size={16} className="shrink-0 mt-0.5" />
      <span className="flex-1">{t('offline.pageNotice', { label: text })}</span>
      <button
        type="button"
        onClick={() => {
          dismissOfflineNotice();
          setDismissed(true);
        }}
        className="shrink-0 p-1 rounded-md text-amber-800/80 hover:bg-amber-100 hover:text-amber-950 transition-colors"
        aria-label={t('common.dismiss')}
      >
        <X size={16} />
      </button>
    </div>
  );
}
