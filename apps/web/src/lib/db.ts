import type { Book, User, Review, Social, ReadingProgress } from '@repo/types';

// IndexedDB Database and Store Names
const DB_NAME = 'booknest-db';
const DB_VERSION = 1;

enum StoreName {
  USERS = 'users',
  BOOKS = 'books',
  READING_PROGRESS = 'reading-progress',
  REVIEWS = 'reviews',
  SOCIAL = 'social',
  SYNC_QUEUE = 'sync-queue',
  ENCRYPTED_CONTENT = 'encrypted-content',
}

interface SyncQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  store: StoreName;
  data: unknown;
  timestamp: number;
  retries: number;
}

interface EncryptedContent {
  id: string;
  bookId: string;
  chapterIndex: number;
  encryptedData: string;
  encryptionKey: string;
  timestamp: number;
}

/**
 * Initialize IndexedDB database with all object stores
 */
function initializeDatabase(db: IDBDatabase): void {
  // Users store
  if (!db.objectStoreNames.contains(StoreName.USERS)) {
    const userStore = db.createObjectStore(StoreName.USERS, { keyPath: 'id' });
    userStore.createIndex('email', 'email', { unique: true });
  }

  // Books store
  if (!db.objectStoreNames.contains(StoreName.BOOKS)) {
    const bookStore = db.createObjectStore(StoreName.BOOKS, { keyPath: 'id' });
    bookStore.createIndex('authorId', 'authorId', { unique: false });
    bookStore.createIndex('createdAt', 'createdAt', { unique: false });
  }

  // Reading progress store
  if (!db.objectStoreNames.contains(StoreName.READING_PROGRESS)) {
    const progressStore = db.createObjectStore(StoreName.READING_PROGRESS, {
      keyPath: 'id',
    });
    progressStore.createIndex('userId', 'userId', { unique: false });
    progressStore.createIndex('bookId', 'bookId', { unique: false });
  }

  // Reviews store
  if (!db.objectStoreNames.contains(StoreName.REVIEWS)) {
    const reviewStore = db.createObjectStore(StoreName.REVIEWS, { keyPath: 'id' });
    reviewStore.createIndex('userId', 'userId', { unique: false });
    reviewStore.createIndex('bookId', 'bookId', { unique: false });
  }

  // Social store
  if (!db.objectStoreNames.contains(StoreName.SOCIAL)) {
    const socialStore = db.createObjectStore(StoreName.SOCIAL, { keyPath: 'id' });
    socialStore.createIndex('userId', 'userId', { unique: false });
    socialStore.createIndex('followingId', 'followingId', { unique: false });
  }

  // Sync queue store
  if (!db.objectStoreNames.contains(StoreName.SYNC_QUEUE)) {
    const syncStore = db.createObjectStore(StoreName.SYNC_QUEUE, { keyPath: 'id' });
    syncStore.createIndex('timestamp', 'timestamp', { unique: false });
  }

  // Encrypted content store
  if (!db.objectStoreNames.contains(StoreName.ENCRYPTED_CONTENT)) {
    const encStore = db.createObjectStore(StoreName.ENCRYPTED_CONTENT, {
      keyPath: 'id',
    });
    encStore.createIndex('bookId', 'bookId', { unique: false });
    encStore.createIndex('timestamp', 'timestamp', { unique: false });
  }
}

/**
 * Open connection to IndexedDB
 */
export async function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      initializeDatabase(db);
    };
  });
}

/**
 * Generic get operation from IndexedDB
 */
export async function dbGet<T>(storeName: StoreName, key: string): Promise<T | undefined> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Generic put operation to IndexedDB
 */
export async function dbPut<T extends { id: string }>(
  storeName: StoreName,
  data: T
): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(data);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Generic delete operation from IndexedDB
 */
export async function dbDelete(storeName: StoreName, key: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Get all items from a store
 */
export async function dbGetAll<T>(storeName: StoreName): Promise<T[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Query by index
 */
export async function dbQuery<T>(
  storeName: StoreName,
  indexName: string,
  key: string
): Promise<T[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Add item to sync queue for later synchronization
 */
export async function addToSyncQueue(
  action: 'create' | 'update' | 'delete',
  store: StoreName,
  data: unknown
): Promise<void> {
  const item: SyncQueueItem = {
    id: `${store}-${Date.now()}-${Math.random()}`,
    action,
    store,
    data,
    timestamp: Date.now(),
    retries: 0,
  };

  await dbPut(StoreName.SYNC_QUEUE, item as any);
}

/**
 * Get all pending sync items
 */
export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  return dbGetAll<SyncQueueItem>(StoreName.SYNC_QUEUE);
}

/**
 * Clear sync queue item after successful sync
 */
export async function clearSyncQueueItem(id: string): Promise<void> {
  await dbDelete(StoreName.SYNC_QUEUE, id);
}

/**
 * Store encrypted book content
 */
export async function storeEncryptedContent(
  bookId: string,
  chapterIndex: number,
  encryptedData: string,
  encryptionKey: string
): Promise<void> {
  const content: EncryptedContent = {
    id: `${bookId}-${chapterIndex}`,
    bookId,
    chapterIndex,
    encryptedData,
    encryptionKey,
    timestamp: Date.now(),
  };

  await dbPut(StoreName.ENCRYPTED_CONTENT, content as any);
}

/**
 * Retrieve encrypted content by book
 */
export async function getEncryptedContentByBook(bookId: string): Promise<EncryptedContent[]> {
  return dbQuery<EncryptedContent>(StoreName.ENCRYPTED_CONTENT, 'bookId', bookId);
}

/**
 * Clear all IndexedDB data (for logout/reset)
 */
export async function clearDatabase(): Promise<void> {
  const db = await openDatabase();
  const storeNames = Object.values(StoreName);

  for (const storeName of storeNames) {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

export { StoreName, SyncQueueItem, EncryptedContent };
