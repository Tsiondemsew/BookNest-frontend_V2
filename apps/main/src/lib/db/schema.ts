import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface ReadingProgress {
  id: string;
  userId: string;
  bookFormatId: string;
  progressPercent: number;
  lastPosition: number;
  total: number;
  updatedAt: string;
  synced: number; // 0 = not synced, 1 = synced
  pendingPagesDelta?: number;
  pendingMinutesDelta?: number;
}

export interface OfflineQueueItem {
  id: string;
  action: 'UPDATE_PROGRESS' | 'CREATE_REVIEW' | 'RECORD_ACTIVITY';
  payload: Record<string, unknown>;
  createdAt: string;
  retries: number;
}

export interface OfflineBook {
  id: string;  // bookFormatId
  bookFormatId: string;
  title: string;
  formatType: 'PDF' | 'Audio';
  fileData: ArrayBuffer;
  fileSize: number;
  downloadedAt: string;
  lastAccessed: string;
  bookId?: string;
  coverUrl?: string | null;
}

export interface OfflineCover {
  bookFormatId: string;
  coverBlob: Blob;
  cachedAt: string;
}

interface BookNestDB extends DBSchema {
  'reading_progress': {
    key: string;
    value: ReadingProgress;
    indexes: {
      'synced': number;
      'bookFormatId': string;
    };
  };
  'offline_queue': {
    key: string;
    value: OfflineQueueItem;
    indexes: {
      'createdAt': string;
    };
  };
  'offline_books': {
    key: string;
    value: OfflineBook;
    indexes: {
      'bookFormatId': string;
    };
  };
  'offline_covers': {
    key: string;
    value: OfflineCover;
  };
  'library_cache': {
    key: string;
    value: { key: string; savedAt: string; items: import('@repo/types').LibraryItem[] };
  };
}

let dbInstance: IDBPDatabase<BookNestDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<BookNestDB>> {
  if (dbInstance) return dbInstance;
  
  dbInstance = await openDB<BookNestDB>('BookNestDB', 4, {
    async upgrade(db, oldVersion) {
      // Version 1 stores
      if (!db.objectStoreNames.contains('reading_progress')) {
        const progressStore = db.createObjectStore('reading_progress', { keyPath: 'id' });
        progressStore.createIndex('synced', 'synced');
        progressStore.createIndex('bookFormatId', 'bookFormatId');
      }
      
      if (!db.objectStoreNames.contains('offline_queue')) {
        const queueStore = db.createObjectStore('offline_queue', { keyPath: 'id' });
        queueStore.createIndex('createdAt', 'createdAt');
      }
      
      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains('offline_books')) {
          const booksStore = db.createObjectStore('offline_books', { keyPath: 'id' });
          booksStore.createIndex('bookFormatId', 'bookFormatId');
        }
      }

      if (oldVersion < 3 && !db.objectStoreNames.contains('offline_covers')) {
        db.createObjectStore('offline_covers', { keyPath: 'bookFormatId' });
      }

      if (oldVersion < 4 && !db.objectStoreNames.contains('library_cache')) {
        db.createObjectStore('library_cache', { keyPath: 'key' });
      }
    },
  });
  
  return dbInstance;
}

// Helper functions for reading_progress
export async function getLocalProgress(
  userId: string,
  bookFormatId: string
): Promise<ReadingProgress | null> {
  const db = await getDB();
  const id = `${userId}_${bookFormatId}`;
  const progress = await db.get('reading_progress', id);
  return progress || null;
}

export async function saveLocalProgress(progress: ReadingProgress): Promise<void> {
  const db = await getDB();
  await db.put('reading_progress', progress);
}

export async function getAllUnsyncedProgress(): Promise<ReadingProgress[]> {
  const db = await getDB();
  const allProgress = await db.getAll('reading_progress');
  return allProgress.filter(p => p.synced === 0);
}

export async function markProgressSynced(id: string, clearPending = true): Promise<void> {
  const db = await getDB();
  const progress = await db.get('reading_progress', id);
  if (progress) {
    await db.put('reading_progress', {
      ...progress,
      synced: 1,
      ...(clearPending
        ? { pendingPagesDelta: 0, pendingMinutesDelta: 0 }
        : {}),
    });
  }
}

// Helper functions for offline_books
export async function saveOfflineBook(book: OfflineBook): Promise<void> {
  const db = await getDB();
  await db.put('offline_books', book);
}

export async function getOfflineBook(bookFormatId: string): Promise<OfflineBook | null> {
  const db = await getDB();
  const book = await db.get('offline_books', bookFormatId);
  return book || null;
}

export async function getAllOfflineBooks(): Promise<OfflineBook[]> {
  const db = await getDB();
  return await db.getAll('offline_books');
}

export async function deleteOfflineBook(bookFormatId: string): Promise<void> {
  const db = await getDB();
  await db.delete('offline_books', bookFormatId);
  try {
    await db.delete('offline_covers', bookFormatId);
  } catch {
    /* store may not exist on old DB */
  }
}

export async function enqueueOfflineQueueItem(
  item: Pick<OfflineQueueItem, 'action' | 'payload'>
): Promise<void> {
  const db = await getDB();
  const id = `q-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  await db.put('offline_queue', {
    id,
    action: item.action,
    payload: item.payload,
    createdAt: new Date().toISOString(),
    retries: 0,
  });
}

export async function getAllOfflineQueueItems(): Promise<OfflineQueueItem[]> {
  const db = await getDB();
  return db.getAll('offline_queue');
}

export async function deleteOfflineQueueItem(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('offline_queue', id);
}

export async function updateOfflineQueueRetries(id: string, retries: number): Promise<void> {
  const db = await getDB();
  const item = await db.get('offline_queue', id);
  if (item) {
    await db.put('offline_queue', { ...item, retries });
  }
}

export async function saveOfflineCover(bookFormatId: string, coverBlob: Blob): Promise<void> {
  const db = await getDB();
  await db.put('offline_covers', {
    bookFormatId,
    coverBlob,
    cachedAt: new Date().toISOString(),
  });
}

export async function getOfflineCover(bookFormatId: string): Promise<Blob | null> {
  const db = await getDB();
  const row = await db.get('offline_covers', bookFormatId);
  return row?.coverBlob ?? null;
}

const LIBRARY_CACHE_KEY = 'current';

export async function saveLibraryCacheToDb(
  items: import('@repo/types').LibraryItem[]
): Promise<void> {
  const db = await getDB();
  await db.put('library_cache', {
    key: LIBRARY_CACHE_KEY,
    savedAt: new Date().toISOString(),
    items,
  });
}

export async function getLibraryCacheFromDb(): Promise<
  import('@repo/types').LibraryItem[] | null
> {
  const db = await getDB();
  const row = await db.get('library_cache', LIBRARY_CACHE_KEY);
  return row?.items?.length ? row.items : null;
}