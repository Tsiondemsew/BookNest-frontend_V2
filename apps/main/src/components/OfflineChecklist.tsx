'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Circle, Loader2, RefreshCw, WifiOff } from 'lucide-react';
import { getOfflineReadiness, type OfflineCheckItem } from '@/lib/offline/offlineStatus';
import { getStorageInfo } from '@/lib/offline/downloadService';
import { useTranslation } from '@/hooks/useTranslation';

export function OfflineChecklist() {
  const { t } = useTranslation();
  const [items, setItems] = useState<OfflineCheckItem[]>([]);
  const [ready, setReady] = useState(false);
  const [storage, setStorage] = useState<{ usedMB: number; quotaMB: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getOfflineReadiness();
      setItems(result.items);
      setReady(result.readyForReading);
      const info = await getStorageInfo();
      setStorage({ usedMB: info.usedMB, quotaMB: info.quotaMB });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-[#1A2A3A] flex items-center gap-2">
            <WifiOff size={18} className="text-[#B85C38]" />
            {t('offline.checklistTitle')}
          </h3>
          <p className="text-sm text-[#4A5568] mt-1">{t('offline.checklistDesc')}</p>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={loading}
          className="p-2 rounded-lg border border-[#E8E2D9] text-[#4A5568] hover:bg-[#F5F1EB] disabled:opacity-50"
          aria-label={t('common.tryAgain')}
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
        </button>
      </div>

      {ready ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {t('offline.readyToRead')}
        </div>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {t('offline.notReadyYet')}
        </div>
      )}

      {storage && storage.quotaMB > 0 && (
        <p className="text-xs text-[#4A5568]">
          {t('offline.storageUsed', {
            used: storage.usedMB,
            total: storage.quotaMB,
          })}
        </p>
      )}

      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex gap-3 p-3 rounded-xl border border-[#E8E2D9] bg-[#FDFBF7]"
          >
            {item.ok ? (
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <Circle size={20} className="text-[#4A5568]/50 shrink-0 mt-0.5" />
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#1A2A3A]">{t(item.labelKey)}</p>
              <p className="text-xs text-[#4A5568] mt-0.5">
                {t(item.hintKey, item.hintParams)}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <p className="text-xs text-[#4A5568] border-t border-[#E8E2D9] pt-3">
        {t('offline.devNote')}
      </p>
    </div>
  );
}
