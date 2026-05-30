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
  action: 'UPDATE_PROGRESS' | 'CREATE_REVIEW';
  payload: any;
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
}

let dbInstance: IDBPDatabase<BookNestDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<BookNestDB>> {
  if (dbInstance) return dbInstance;
  
  dbInstance = await openDB<BookNestDB>('BookNestDB', 2, {
    async upgrade(db, oldVersion, newVersion, transaction) {
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
      
      // Version 2: Add offline_books store (new in version 2)
      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains('offline_books')) {
          const booksStore = db.createObjectStore('offline_books', { keyPath: 'id' });
          booksStore.createIndex('bookFormatId', 'bookFormatId');
        }
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
}