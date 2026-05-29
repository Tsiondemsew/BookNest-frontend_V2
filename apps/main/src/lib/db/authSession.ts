import { openDB } from 'idb';
import type { SessionUser } from '@repo/types';

interface StoredSession {
  id: string;
  user: SessionUser;
  issuedAt: string;
  expiresAt: string;
  rememberMe?: boolean;
}

const DB_NAME = 'BookNestAuth';
const STORE_NAME = 'sessions';

/** Extra offline grace after cookie expiry when "Keep me signed in" is enabled */
const OFFLINE_GRACE_REMEMBER_MS = 7 * 24 * 60 * 60 * 1000;

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
  const grace = session.rememberMe ? OFFLINE_GRACE_REMEMBER_MS : 0;

  return Date.now() < expiresAt + grace;
}
