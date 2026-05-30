'use client';

import { WifiOff } from 'lucide-react';

export function OfflinePageNotice({ label = 'Showing saved data' }: { label?: string }) {
  if (typeof navigator !== 'undefined' && navigator.onLine) return null;

  return (
    <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <WifiOff size={16} className="shrink-0" />
      <span>
        You&apos;re offline — {label}. Connect to refresh.
      </span>
    </div>
  );
}
