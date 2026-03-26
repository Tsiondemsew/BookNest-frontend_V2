import { OfflineError } from './errors';

interface QueuedRequest {
  id: string;
  method: string;
  url: string;
  body?: any;
  timestamp: number;
  retries: number;
}

class OfflineQueue {
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initDB();
    }
  }

  private initDB() {
    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open('BookNestQueueDB', 1);
      request.onerror = () => reject(request.error);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('requests')) {
          db.createObjectStore('requests', { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
    });
  }

  private async getDB(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.initDB();
    }
    const db = await this.dbPromise;
    if (!db) {
      throw new Error('Failed to initialize IndexedDB');
    }
    return db;
  }

  async addRequest(request: Omit<QueuedRequest, 'id' | 'timestamp'>): Promise<string | null> {
    if (!navigator.onLine) {
      const queuedRequest: QueuedRequest = {
        ...request,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        retries: 0,
      };
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('requests', 'readwrite');
        const store = tx.objectStore('requests');
        const addRequest = store.add(queuedRequest);
        addRequest.onerror = () => reject(addRequest.error);
        addRequest.onsuccess = () => resolve(queuedRequest.id);
        tx.onerror = () => reject(tx.error);
      });
    }
    return null;
  }

  async getPendingRequests(): Promise<QueuedRequest[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('requests', 'readonly');
      const store = tx.objectStore('requests');
      const getAllRequest = store.getAll();
      getAllRequest.onerror = () => reject(getAllRequest.error);
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      tx.onerror = () => reject(tx.error);
    });
  }

  async removeRequest(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('requests', 'readwrite');
      const store = tx.objectStore('requests');
      const deleteRequest = store.delete(id);
      deleteRequest.onerror = () => reject(deleteRequest.error);
      deleteRequest.onsuccess = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async clear(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('requests', 'readwrite');
      const store = tx.objectStore('requests');
      const clearRequest = store.clear();
      clearRequest.onerror = () => reject(clearRequest.error);
      clearRequest.onsuccess = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

export const offlineQueue = new OfflineQueue();