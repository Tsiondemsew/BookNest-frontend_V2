import { getDB, saveOfflineBook, getOfflineBook, getAllOfflineBooks, deleteOfflineBook, OfflineBook } from '@/lib/db/schema';
import { apiClient } from '@/lib/api/client';

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
      percentageUsed: Math.round((usedMB / quotaMB) * 100),
    };
  }
  
  return { availableMB: 100, usedMB: 0, quotaMB: 512, percentageUsed: 0 };
}
export async function downloadBookForOffline(
  bookFormatId: string,
  title: string,
  formatType: 'PDF' | 'Audio',
  fileSizeMB: number
): Promise<{ success: boolean; error?: string; fileSize?: number }> {
  const { isSufficient, available } = await checkStorageSpace(fileSizeMB);
  if (!isSufficient) {
    return {
      success: false,
      error: `Not enough space. Need ${fileSizeMB}MB, only ${available}MB available.`,
    };
  }
  
  try {
    // Use absolute URL for development to ensure correct origin
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const url = `${apiUrl}/api/download/${bookFormatId}`;
    
    console.log('Downloading from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',  // Important: sends cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Download failed: ${response.status}`);
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
  } catch (error: any) {
    console.error('Download failed:', error);
    return { success: false, error: error.message };
  }
}

export async function isBookDownloaded(bookFormatId: string): Promise<boolean> {
  const book = await getOfflineBook(bookFormatId);
  return !!book;
}

export async function getDownloadedBooks(): Promise<OfflineBook[]> {
  return await getAllOfflineBooks();
}

export async function removeOfflineBook(bookFormatId: string): Promise<void> {
  await deleteOfflineBook(bookFormatId);
}

export async function getOfflineBookData(bookFormatId: string): Promise<ArrayBuffer | null> {
  const book = await getOfflineBook(bookFormatId);
  return book?.fileData || null;
}