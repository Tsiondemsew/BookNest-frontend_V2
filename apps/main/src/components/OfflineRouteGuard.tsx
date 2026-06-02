'use client';

import { usePathname } from 'next/navigation';
import { isOfflineAllowedPath } from '@/lib/offline/offlineAccess';
import { OnlineRequired } from '@/components/OnlineRequired';

export function OfflineRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const offline = typeof navigator !== 'undefined' && !navigator.onLine;

  if (!offline || isOfflineAllowedPath(pathname)) {
    return <>{children}</>;
  }

  return <OnlineRequired />;
}
