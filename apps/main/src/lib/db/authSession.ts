import { openDB } from 'idb';
import type { SessionUser } from '@repo/types';

// ✅ Remove token - we don't store tokens in IndexedDB for security
interface StoredSession {
  id: string;
  user: SessionUser;  // Use the full SessionUser type
  issuedAt: string;
  expiresAt: string;
}

const DB_NAME = 'BookNestAuth';
const STORE_NAME = 'sessions';

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
  
  const now = new Date();
  const expiresAt = new Date(session.expiresAt);
  return expiresAt > now;
}