import { getAllOfflineBooks } from '@/lib/db/schema';
import { isSessionValid, isSessionValidForOfflineReading, getSession } from '@/lib/db/authSession';
import { getLibraryCache } from '@/lib/offline/libraryCache';
import { isInstalledPwa } from '@/lib/pwa/isInstalledPwa';
import { isServiceWorkerActive } from '@/lib/pwa/serviceWorkerStatus';

export type OfflineCheckItem = {
  id: string;
  labelKey: string;
  hintKey: string;
  hintParams?: Record<string, string | number>;
  ok: boolean;
};

export async function getOfflineReadiness(): Promise<{
  items: OfflineCheckItem[];
  readyForReading: boolean;
}> {
  const installed = isInstalledPwa();
  const swActive = await isServiceWorkerActive();
  const offlineShellAvailable = installed || swActive;
  const session = await getSession();
  const sessionOk = navigator.onLine
    ? await isSessionValid()
    : await isSessionValidForOfflineReading();

  const offlineBooks = await getAllOfflineBooks();
  const hasDownloads = offlineBooks.length > 0;
  const hasLibraryCache = Boolean(getLibraryCache()?.length);

  const items: OfflineCheckItem[] = [
    {
      id: 'install',
      labelKey: 'offline.check.install',
      hintKey: offlineShellAvailable ? 'offline.check.installOk' : 'offline.check.installFail',
      ok: offlineShellAvailable,
    },
    {
      id: 'sw',
      labelKey: 'offline.check.shell',
      hintKey: swActive ? 'offline.check.shellOk' : 'offline.check.shellFail',
      ok: swActive,
    },
    {
      id: 'session',
      labelKey: 'offline.check.session',
      hintKey: sessionOk
        ? session?.rememberMe
          ? 'offline.check.sessionRememberOk'
          : 'offline.check.sessionOk'
        : 'offline.check.sessionFail',
      ok: sessionOk,
    },
    {
      id: 'downloads',
      labelKey: 'offline.check.downloads',
      hintKey: hasDownloads ? 'offline.check.downloadsOk' : 'offline.check.downloadsFail',
      hintParams: { count: offlineBooks.length },
      ok: hasDownloads,
    },
    {
      id: 'library-cache',
      labelKey: 'offline.check.libraryCache',
      hintKey: hasLibraryCache ? 'offline.check.libraryCacheOk' : 'offline.check.libraryCacheFail',
      ok: hasLibraryCache || hasDownloads,
    },
  ];

  const readyForReading = offlineShellAvailable && sessionOk && hasDownloads;

  return { items, readyForReading };
}
