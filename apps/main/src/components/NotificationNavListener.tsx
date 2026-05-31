'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Routes push-notification clicks from the service worker into the app. */
export function NotificationNavListener() {
  const router = useRouter();

  useEffect(() => {
    const onPushNav = (event: MessageEvent) => {
      const path = event.data?.url;
      if (event.data?.type === 'NOTIFICATION_NAV' && typeof path === 'string' && path.startsWith('/')) {
        router.push(path);
      }
    };

    navigator.serviceWorker?.addEventListener('message', onPushNav);
    return () => navigator.serviceWorker?.removeEventListener('message', onPushNav);
  }, [router]);

  return null;
}
