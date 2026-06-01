import { getOfflineCover, saveOfflineCover } from '@/lib/db/schema';

export async function cacheCoverForBook(bookFormatId: string, coverUrl: string | null | undefined) {
  if (!coverUrl || !navigator.onLine) return;
  try {
    const existing = await getOfflineCover(bookFormatId);
    if (existing) return;

    const response = await fetch(coverUrl, { mode: 'cors', credentials: 'omit' });
    if (!response.ok) return;

    const blob = await response.blob();
    if (blob.size > 2 * 1024 * 1024) return;

    await saveOfflineCover(bookFormatId, blob);
  } catch {
    /* optional — covers fall back to network or placeholder */
  }
}

export async function getCachedCoverObjectUrl(bookFormatId: string): Promise<string | null> {
  const blob = await getOfflineCover(bookFormatId);
  if (!blob) return null;
  return URL.createObjectURL(blob);
}
