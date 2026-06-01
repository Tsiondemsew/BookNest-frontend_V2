'use client';

import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { canUseOfflineSession } from '@/lib/offline/offlineAccess';
import { getDownloadedBooks } from '@/lib/offline/downloadService';
import { useTranslation } from '@/hooks/useTranslation';

export function OfflineIndicator() {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(true);
  const [downloadedCount, setDownloadedCount] = useState(0);
  const { user } = useAuthStore();

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline) return;
    void getDownloadedBooks().then((books) => setDownloadedCount(books.length));
  }, [isOnline]);

  if (isOnline) return null;

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
        <div>
          <p className="font-medium">{t('auth.offline')}</p>
          <p className="text-white/80 text-xs mt-0.5">{detail}</p>
        </div>
      </div>
    </div>
  );
}
