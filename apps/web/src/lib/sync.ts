import { getSyncQueue, clearSyncQueueItem, StoreName } from './db';
import type { SyncQueueItem } from './db';

/**
 * Sync service handles synchronizing offline changes back to the server
 * when connectivity is restored.
 */

interface SyncResult {
  success: boolean;
  itemId: string;
  error?: string;
}

/**
 * Sync a single queue item to the backend
 */
async function syncItem(item: SyncQueueItem): Promise<SyncResult> {
  try {
    // Determine the API endpoint based on store type
    const endpoint = getEndpointForStore(item.store, item.action);

    const response = await fetch(endpoint, {
      method: getMethodForAction(item.action),
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include HTTP-only cookies
      body: JSON.stringify(item.data),
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    // Clear from sync queue after successful sync
    await clearSyncQueueItem(item.id);

    return {
      success: true,
      itemId: item.id,
    };
  } catch (error) {
    return {
      success: false,
      itemId: item.id,
      error: error instanceof Error ? error.message : 'Unknown sync error',
    };
  }
}

/**
 * Get API endpoint based on store and action
 */
function getEndpointForStore(store: StoreName, action: string): string {
  const baseUrls: Record<StoreName, string> = {
    [StoreName.USERS]: '/api/users',
    [StoreName.BOOKS]: '/api/books',
    [StoreName.READING_PROGRESS]: '/api/reading-progress',
    [StoreName.REVIEWS]: '/api/reviews',
    [StoreName.SOCIAL]: '/api/social',
    [StoreName.SYNC_QUEUE]: '/api/sync',
    [StoreName.ENCRYPTED_CONTENT]: '/api/encrypted-content',
  };

  const baseUrl = baseUrls[store];

  if (action === 'delete') {
    return `${baseUrl}/:id`;
  }

  return baseUrl;
}

/**
 * Get HTTP method based on action
 */
function getMethodForAction(action: string): 'POST' | 'PUT' | 'DELETE' {
  switch (action) {
    case 'create':
      return 'POST';
    case 'update':
      return 'PUT';
    case 'delete':
      return 'DELETE';
    default:
      return 'POST';
  }
}

/**
 * Sync all pending changes to backend
 */
export async function syncAllPending(): Promise<{
  synced: number;
  failed: number;
  results: SyncResult[];
}> {
  const queue = await getSyncQueue();

  if (queue.length === 0) {
    return { synced: 0, failed: 0, results: [] };
  }

  const results = await Promise.all(queue.map(item => syncItem(item)));

  const synced = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  return { synced, failed, results };
}

/**
 * Start background sync when online
 */
export function startBackgroundSync(onlineCallback?: (results: any) => void): () => void {
  const syncInterval = setInterval(async () => {
    if (navigator.onLine) {
      const results = await syncAllPending();
      if (results.synced > 0 || results.failed > 0) {
        onlineCallback?.(results);
      }
    }
  }, 30000); // Sync every 30 seconds when online

  const handleOnline = async () => {
    const results = await syncAllPending();
    onlineCallback?.(results);
  };

  window.addEventListener('online', handleOnline);

  return () => {
    clearInterval(syncInterval);
    window.removeEventListener('online', handleOnline);
  };
}

export type { SyncResult };
