import { getOfflineBookData } from '@/lib/offline/downloadService';
import { downloadApi } from '@/lib/api/client';
import { apiConfig } from '@/lib/api/config';

export type LoadBookFileResult = {
  data: ArrayBuffer;
  fromCache: boolean;
};

async function normalizeOfflineBookBytes(
  value: ArrayBuffer | Uint8Array | Blob | null
): Promise<ArrayBuffer | null> {
  if (!value) return null;
  if (value instanceof ArrayBuffer) return value;
  if (value instanceof Uint8Array) {
    const buffer = new ArrayBuffer(value.byteLength);
    new Uint8Array(buffer).set(value);
    return buffer;
  }
  if (value instanceof Blob) {
    return await value.arrayBuffer();
  }
  return null;
}

export type AudioLoadProgress = {
  loadedBytes: number;
  totalBytes: number | null;
  percent: number | null;
};

export type AudioPlaybackSource = {
  blobUrl: string;
  fromCache: boolean;
  revoke: () => void;
};

/** Session cache — instant replay when reopening the same audiobook. */
const sessionAudioCache = new Map<string, { blobUrl: string; revoke: () => void }>();

function cacheSessionAudio(bookFormatId: string, blobUrl: string) {
  const existing = sessionAudioCache.get(bookFormatId);
  if (existing) existing.revoke();
  sessionAudioCache.set(bookFormatId, {
    blobUrl,
    revoke: () => URL.revokeObjectURL(blobUrl),
  });
}

function getSessionAudio(bookFormatId: string): AudioPlaybackSource | null {
  const hit = sessionAudioCache.get(bookFormatId);
  if (!hit) return null;
  return { blobUrl: hit.blobUrl, fromCache: true, revoke: hit.revoke };
}

/**
 * Download the complete audio file in the background.
 * UI can render immediately; playback is enabled only when percent === 100.
 */
export async function loadAudioForPlayback(
  bookFormatId: string,
  onProgress?: (progress: AudioLoadProgress) => void
): Promise<AudioPlaybackSource> {
  const sessionHit = getSessionAudio(bookFormatId);
  if (sessionHit) {
    onProgress?.({
      loadedBytes: 0,
      totalBytes: null,
      percent: 100,
    });
    return sessionHit;
  }

  const cached = await getOfflineBookData(bookFormatId);
  const offlineData = await normalizeOfflineBookBytes(cached);
  if (offlineData) {
    const blobUrl = URL.createObjectURL(new Blob([offlineData]));
    cacheSessionAudio(bookFormatId, blobUrl);
    onProgress?.({
      loadedBytes: offlineData.byteLength,
      totalBytes: offlineData.byteLength,
      percent: 100,
    });
    return {
      blobUrl,
      fromCache: true,
      revoke: () => URL.revokeObjectURL(blobUrl),
    };
  }

  if (!navigator.onLine) {
    throw new Error('You are offline and this audiobook is not downloaded yet.');
  }

  const url = downloadApi.getDownloadUrl(bookFormatId);
  const response = await fetch(url, { method: 'GET', credentials: 'include', cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Failed to load audio (${response.status})`);
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json') || contentType.includes('text/html')) {
    throw new Error('Failed to load audio: unexpected response from server.');
  }

  const totalBytes = Number(response.headers.get('content-length')) || null;
  const reader = response.body?.getReader();

  if (!reader) {
    const data = await response.arrayBuffer();
    const blobUrl = URL.createObjectURL(new Blob([data]));
    cacheSessionAudio(bookFormatId, blobUrl);
    onProgress?.({
      loadedBytes: data.byteLength,
      totalBytes: data.byteLength,
      percent: 100,
    });
    return {
      blobUrl,
      fromCache: false,
      revoke: () => URL.revokeObjectURL(blobUrl),
    };
  }

  const chunks: Uint8Array[] = [];
  let loadedBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    chunks.push(value);
    loadedBytes += value.byteLength;

    const percent = totalBytes
      ? Math.min(99, Math.round((loadedBytes / totalBytes) * 100))
      : null;

    onProgress?.({ loadedBytes, totalBytes, percent });
  }

  const fullBuffer = new Uint8Array(loadedBytes);
  let offset = 0;
  for (const chunk of chunks) {
    fullBuffer.set(chunk, offset);
    offset += chunk.byteLength;
  }

  const blobUrl = URL.createObjectURL(new Blob([fullBuffer]));
  cacheSessionAudio(bookFormatId, blobUrl);

  onProgress?.({
    loadedBytes,
    totalBytes: totalBytes ?? loadedBytes,
    percent: 100,
  });

  return {
    blobUrl,
    fromCache: false,
    revoke: () => URL.revokeObjectURL(blobUrl),
  };
}

function getApiOrigin(): string {
  try {
    return new URL(apiConfig.baseUrl).origin;
  } catch {
    return apiConfig.baseUrl.replace(/\/$/, '');
  }
}

/**
 * Load book bytes: IndexedDB cache first, then authenticated backend download proxy.
 */
export async function loadBookFileBytes(bookFormatId: string): Promise<LoadBookFileResult> {
  const cached = await getOfflineBookData(bookFormatId);
  if (cached) {
    return { data: cached, fromCache: true };
  }

  if (!navigator.onLine) {
    throw new Error(
      'You are offline and this book is not downloaded. Download it from your library while online.'
    );
  }

  const url = downloadApi.getDownloadUrl(bookFormatId);
  const apiOrigin = getApiOrigin();

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });
  } catch (err) {
    const hint =
      err instanceof TypeError
        ? ` Cannot reach the API at ${apiOrigin}. Check that the backend is running and NEXT_PUBLIC_API_URL is correct.`
        : '';
    throw new Error(`Failed to load book.${hint}`);
  }

  if (!response.ok) {
    let message = `Failed to load book (${response.status})`;
    try {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const err = await response.json();
        message = err?.error?.message || message;
      }
    } catch {
      // ignore
    }
    if (response.status === 401) {
      message = 'Session expired. Please sign in again and reopen the book.';
    } else if (response.status === 403) {
      message = 'You do not have access to this book. Open it from your library after purchase.';
    }
    throw new Error(message);
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('text/html') || contentType.includes('application/json')) {
    throw new Error('Downloaded book returned an invalid response. Please try again.');
  }

  const data = await response.arrayBuffer();
  if (!data.byteLength) {
    throw new Error('Book file is empty');
  }

  return { data, fromCache: false };
}

export function normalizeFormatType(
  type: string | undefined
): 'PDF' | 'Audio' | null {
  if (!type) return null;
  const t = type.toUpperCase();
  if (t === 'PDF') return 'PDF';
  if (t === 'AUDIO') return 'Audio';
  return null;
}
