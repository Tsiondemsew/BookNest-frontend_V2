import { openDB } from 'idb';
import type { SessionUser } from '@repo/types';

interface StoredSession {
  id: string;
  user: SessionUser;
  issuedAt: string;
  expiresAt: string;
  rememberMe?: boolean;
}

const DB_NAME = 'BookNestAdminAuth';
const STORE_NAME = 'sessions';
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
  return (await db.get(STORE_NAME, 'current')) || null;
}

export async function clearSession(): Promise<void> {
  const db = await getAuthDB();
  await db.delete(STORE_NAME, 'current');
}

export async function isSessionValid(): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;
  return Date.now() < new Date(session.expiresAt).getTime() + CLOCK_SKEW_MS;
}
