import {
  getOfflineBook,
  getAllOfflineBooks,
  deleteOfflineBook,
  saveOfflineBook,
  OfflineBook,
} from '@/lib/db/schema';
import { downloadApi } from '@/lib/api/client';
import { isInstalledPwa } from '@/lib/pwa/isInstalledPwa';

export async function checkStorageSpace(fileSizeMB: number): Promise<{
  available: number;
  isSufficient: boolean;
}> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    const used = (estimate.usage || 0) / (1024 * 1024);
    const quota = (estimate.quota || 0) / (1024 * 1024);
    const available = quota - used;

    return {
      available: Math.round(available),
      isSufficient: available > fileSizeMB + 10,
    };
  }

  return { available: 100, isSufficient: true };
}

export async function getStorageInfo(): Promise<{
  availableMB: number;
  usedMB: number;
  quotaMB: number;
  percentageUsed: number;
}> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    const quotaMB = (estimate.quota || 0) / (1024 * 1024);
    const usedMB = (estimate.usage || 0) / (1024 * 1024);
    const availableMB = quotaMB - usedMB;

    return {
      availableMB: Math.round(availableMB),
      usedMB: Math.round(usedMB),
      quotaMB: Math.round(quotaMB),
      percentageUsed: quotaMB > 0 ? Math.round((usedMB / quotaMB) * 100) : 0,
    };
  }

  return { availableMB: 100, usedMB: 0, quotaMB: 512, percentageUsed: 0 };
}

export function canDownloadOffline(): { allowed: boolean; reason?: string } {
  if (!isInstalledPwa()) {
    return {
      allowed: false,
      reason:
        'Install the BookNest app to save books for offline reading. Browser tabs cannot access downloads when offline.',
    };
  }
  return { allowed: true };
}

export async function downloadBookForOffline(
  bookFormatId: string,
  title: string,
  formatType: 'PDF' | 'Audio',
  fileSizeMB: number
): Promise<{ success: boolean; error?: string; fileSize?: number }> {
  const pwaCheck = canDownloadOffline();
  if (!pwaCheck.allowed) {
    return { success: false, error: pwaCheck.reason };
  }

  const { isSufficient, available } = await checkStorageSpace(fileSizeMB);
  if (!isSufficient) {
    return {
      success: false,
      error: `Not enough space. Need ${fileSizeMB}MB, only ${available}MB available.`,
    };
  }

  try {
    const url = downloadApi.getDownloadUrl(bookFormatId);

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        (errorData as { error?: { message?: string } }).error?.message ||
          `Download failed: ${response.status}`
      );
    }

    const fileData = await response.arrayBuffer();
    const fileSize = fileData.byteLength;

    const offlineBook: OfflineBook = {
      id: bookFormatId,
      bookFormatId,
      title,
      formatType,
      fileData,
      fileSize,
      downloadedAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString(),
    };

    await saveOfflineBook(offlineBook);

    return { success: true, fileSize };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Download failed';
    return { success: false, error: message };
  }
}

export async function isBookDownloaded(bookFormatId: string): Promise<boolean> {
  const book = await getOfflineBook(bookFormatId);
  return !!book;
}

export async function getDownloadedBooks(): Promise<OfflineBook[]> {
  return getAllOfflineBooks();
}

export async function removeOfflineBook(bookFormatId: string): Promise<void> {
  await deleteOfflineBook(bookFormatId);
}

export async function getOfflineBookData(bookFormatId: string): Promise<ArrayBuffer | null> {
  const book = await getOfflineBook(bookFormatId);
  return book?.fileData || null;
}
