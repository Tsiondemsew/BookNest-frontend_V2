import { getOfflineBookData } from '@/lib/offline/downloadService';
import { downloadApi } from '@/lib/api/client';
import { apiConfig } from '@/lib/api/config';

export type LoadBookFileResult = {
  data: ArrayBuffer;
  fromCache: boolean;
};

function getApiOrigin(): string {
  try {
    return new URL(apiConfig.baseUrl).origin;
  } catch {
    return apiConfig.baseUrl.replace(/\/$/, '');
  }
}

/**
 * Load book bytes: IndexedDB cache first, then authenticated backend download proxy.
 * Never fetch Supabase signed URLs from the browser (CORS / credentials issues).
 */
export async function loadBookFileBytes(bookFormatId: string): Promise<LoadBookFileResult> {
  const cached = await getOfflineBookData(bookFormatId);
  if (cached) {
    return { data: cached, fromCache: true };
  }

  if (!navigator.onLine) {
    throw new Error(
      'You are offline and this book is not downloaded. Install the BookNest app and download it while online.'
    );
  }

  const url = downloadApi.getDownloadUrl(bookFormatId);
  const apiOrigin = getApiOrigin();

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
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
