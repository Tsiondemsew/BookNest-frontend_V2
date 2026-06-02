'use client';

import { useState, useEffect } from 'react';
import { 
  downloadBookForOffline, 
  isBookDownloaded, 
  removeOfflineBook, 
  getDownloadedBooks,
  checkStorageSpace 
} from '@/lib/offline/downloadService';
import { useAuthStore } from '@/stores/authStore';

export function useOfflineStorage() {
  const { user } = useAuthStore();
  const [downloadedBooks, setDownloadedBooks] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState<Record<string, boolean>>({});
  const [storageInfo, setStorageInfo] = useState<{ available: number; isSufficient: boolean }>({ available: 0, isSufficient: true });

  useEffect(() => {
    if (user) {
      loadDownloadedBooks();
      loadStorageInfo();
    }
  }, [user]);

  const loadDownloadedBooks = async () => {
    const books = await getDownloadedBooks();
    setDownloadedBooks(books.map(b => b.bookFormatId));
  };

  const loadStorageInfo = async () => {
    const info = await checkStorageSpace(0);
    setStorageInfo(info);
  };

  const downloadBook = async (
    bookFormatId: string,
    title: string,
    formatType: 'PDF' | 'Audio', 
    fileSizeMB: number
  ): Promise<{ success: boolean; error?: string }> => {
    setIsDownloading(prev => ({ ...prev, [bookFormatId]: true }));
    
    const result = await downloadBookForOffline(bookFormatId, title, formatType, fileSizeMB);
    
    setIsDownloading(prev => ({ ...prev, [bookFormatId]: false }));
    
    if (result.success) {
      await loadDownloadedBooks();
      await loadStorageInfo();
    }
    
    return result;
  };

  const removeBook = async (bookFormatId: string): Promise<void> => {
    await removeOfflineBook(bookFormatId);
    await loadDownloadedBooks();
    await loadStorageInfo();
  };

  const isDownloaded = (bookFormatId: string): boolean => {
    return downloadedBooks.includes(bookFormatId);
  };

  return {
    downloadBook,
    removeBook,
    isDownloaded,
    isDownloading,
    storageInfo,
    downloadedCount: downloadedBooks.length,
  };
}