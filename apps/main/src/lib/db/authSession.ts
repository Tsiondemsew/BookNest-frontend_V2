import { openDB } from 'idb';
import type { SessionUser } from '@repo/types';
import { isInstalledPwa } from '@/lib/pwa/isInstalledPwa';
import { isServiceWorkerActive } from '@/lib/pwa/serviceWorkerStatus';

interface StoredSession {
  id: string;
  user: SessionUser;
  issuedAt: string;
  expiresAt: string;
  rememberMe?: boolean;
}

const DB_NAME = 'BookNestAuth';
const STORE_NAME = 'sessions';

/** Session validity follows backend expiresAt (30 days with remember-me, 24h otherwise). */
const CLOCK_SKEW_MS = 5 * 60 * 1000;

async function getAuthDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
}

export async function saveSession(session: StoredSession): Promise<void> {
  const db = await getAuthDB();
  await db.put(STORE_NAME, session);
}

export async function getSession(): Promise<StoredSession | null> {
  const db = await getAuthDB();
  const session = await db.get(STORE_NAME, 'current');
  return session || null;
}

export async function clearSession(): Promise<void> {
  const db = await getAuthDB();
  await db.delete(STORE_NAME, 'current');
}

export async function isSessionValid(): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;

  const expiresAt = new Date(session.expiresAt).getTime();
  return Date.now() < expiresAt + CLOCK_SKEW_MS;
}

/** Installed PWA + remember-me: allow reading downloaded books after cookie expiry (offline only). */
const OFFLINE_READING_GRACE_MS = 30 * 24 * 60 * 60 * 1000;

export async function isSessionValidForOfflineReading(): Promise<boolean> {
  if (await isSessionValid()) return true;

  const offlineShellAvailable = isInstalledPwa() || (await isServiceWorkerActive());
  if (!offlineShellAvailable) return false;

  const session = await getSession();
  if (!session?.user) return false;

  if (session.rememberMe) {
    const issued = new Date(session.issuedAt).getTime();
    if (Date.now() < issued + OFFLINE_READING_GRACE_MS) return true;
  }

  return false;
}
