'use client';

import Link from 'next/link';
import { WifiOff } from 'lucide-react';
import { OFFLINE_HOME_PATH } from '@/lib/offline/offlineAccess';
import { useTranslation } from '@/hooks/useTranslation';

export function OnlineRequired() {
  const { t } = useTranslation();

  return (
    <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
      <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
        <WifiOff className="text-amber-700" size={28} />
      </div>
      <h1 className="text-xl font-semibold text-[#1A2A3A]">{t('offline.onlineRequiredTitle')}</h1>
      <p className="text-sm text-[#4A5568]">{t('offline.onlineRequiredBody')}</p>
      <Link
        href={OFFLINE_HOME_PATH}
        className="inline-block px-5 py-2.5 bg-[#B85C38] text-white text-sm font-medium rounded-lg hover:bg-[#8E735B]"
      >
        {t('offline.backToLibrary')}
      </Link>
    </div>
  );
}
