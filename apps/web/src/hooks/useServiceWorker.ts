'use client';

import { useEffect, useState } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isOnline: boolean;
  hasUpdate: boolean;
}

/**
 * useServiceWorker - Register and manage service worker
 * 
 * Features:
 * - Registers service worker for offline support
 * - Detects online/offline status
 * - Handles service worker updates
 * - Provides control for cache management
 */
export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    hasUpdate: false,
  });

  useEffect(() => {
    // Check service worker support
    const isSupported = 'serviceWorker' in navigator;
    setState((prev) => ({ ...prev, isSupported }));

    if (!isSupported) return;

    // Register service worker
    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        console.log('[SW] Registration successful:', registration);
        setState((prev) => ({ ...prev, isRegistered: true }));

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;

          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              console.log('[SW] Update available');
              setState((prev) => ({ ...prev, hasUpdate: true }));
            }
          });
        });

        // Check for updates every hour
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      } catch (error) {
        console.error('[SW] Registration failed:', error);
      }
    };

    registerServiceWorker();

    // Listen for online/offline events
    const handleOnline = () => {
      console.log('[SW] Online');
      setState((prev) => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      console.log('[SW] Offline');
      setState((prev) => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle service worker update
  const handleUpdate = () => {
    if (!navigator.serviceWorker.controller) return;

    const registration = navigator.serviceWorker.controller;
    const waitingWorker = Array.from(
      navigator.serviceWorker.getRegistrations()
    )[0]?.waiting;

    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });

      // Reload after new worker activates
      let reloaded = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!reloaded) {
          reloaded = true;
          window.location.reload();
        }
      });
    }
  };

  // Clear all caches
  const clearCache = async () => {
    if (!('caches' in window)) return;

    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((name) => caches.delete(name)));
    console.log('[SW] Caches cleared');
  };

  return {
    ...state,
    handleUpdate,
    clearCache,
  };
}
