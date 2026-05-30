'use client';

import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const { isOfflineMode, user } = useAuthStore();

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

  // Only show the banner when the browser reports offline.
  // `isOfflineMode` can be enabled briefly when restoring cached sessions even if online.
  if (isOnline) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 max-w-sm bg-[#2C3E50] text-white px-4 py-3 rounded-xl shadow-lg text-sm"
      role="status"
    >
      <div className="flex items-start gap-2">
        <WifiOff size={18} className="flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">You&apos;re offline</p>
          <p className="text-white/80 text-xs mt-0.5">
            {user
              ? 'Browsing works from cache. Downloaded books and saved pages still work — connect to refresh data.'
              : 'Sign in requires an internet connection.'}
          </p>
        </div>
      </div>
    </div>
  );
}
