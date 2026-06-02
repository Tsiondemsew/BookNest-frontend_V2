'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { WifiOff, X } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { canUseOfflineSession } from '@/lib/offline/offlineAccess';
import { getDownloadedBooks } from '@/lib/offline/downloadService';
import { useTranslation } from '@/hooks/useTranslation';
import {
  clearOfflineNoticeDismiss,
  dismissOfflineNotice,
  isOfflineNoticeDismissed,
} from '@/lib/offline/offlineNoticeDismiss';

export function OfflineIndicator() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [isOnline, setIsOnline] = useState(true);
  const [dismissed, setDismissed] = useState(true);
  const [downloadedCount, setDownloadedCount] = useState(0);
  const { user } = useAuthStore();

  useEffect(() => {
    const sync = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      if (online) {
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

  useEffect(() => {
    if (isOnline) return;
    void getDownloadedBooks().then((books) => setDownloadedCount(books.length));
  }, [isOnline]);

  if (isOnline || dismissed) return null;
  if (pathname?.startsWith('/reader/')) return null;

  let detail = t('offline.bannerGuest');
  if (user) {
    detail = canUseOfflineSession()
      ? downloadedCount > 0
        ? t('offline.bannerWithBooks', { count: downloadedCount })
        : t('offline.bannerInstalledNoBooks')
      : t('offline.bannerBrowserTab');
  }

  return (
    <div
      className="fixed bottom-20 sm:bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-50 sm:max-w-sm bg-[#2C3E50] text-white px-4 py-3 rounded-xl shadow-lg text-sm"
      role="status"
    >
      <div className="flex items-start gap-2">
        <WifiOff size={18} className="flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="font-medium">{t('auth.offline')}</p>
          <p className="text-white/80 text-xs mt-0.5">{detail}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            dismissOfflineNotice();
            setDismissed(true);
          }}
          className="shrink-0 p-1 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          aria-label={t('common.dismiss')}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
