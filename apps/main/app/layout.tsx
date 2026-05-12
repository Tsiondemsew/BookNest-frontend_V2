'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { initOfflineSync } from '@/lib/progress/progressService';
import { InstallPrompt } from '@/components/InstallPrompt';
import { AppProviders } from '@/providers/app-providers';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { fetchMe, restoreOfflineSession, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      if (navigator.onLine) {
        await fetchMe();
      } else {
        // Offline - try to restore session from IndexedDB
        await restoreOfflineSession();
      }
    };
    
    initAuth();
    initOfflineSync();

    // Listen for online/offline events
    const handleOnline = async () => {
      await fetchMe();
    };
    
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [fetchMe, restoreOfflineSession]);

  return (
    <html lang="en">
      
      <body>
        <AppProviders>{children}</AppProviders>
        <OfflineIndicator/>
        <InstallPrompt />
      </body>
    </html>
  );
}