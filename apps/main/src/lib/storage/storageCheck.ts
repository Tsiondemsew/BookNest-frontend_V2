/**
 * Check available storage space in browser
 * Returns estimated available space in MB
 */
export async function checkAvailableStorage(): Promise<{
  available: number; // MB
  quota: number;     // MB
  percentageUsed: number;
  isSufficient: boolean;
}> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    const quotaInMB = (estimate.quota || 0) / (1024 * 1024);
    const usageInMB = (estimate.usage || 0) / (1024 * 1024);
    const availableInMB = quotaInMB - usageInMB;
    
    return {
      available: availableInMB,
      quota: quotaInMB,
      percentageUsed: (usageInMB / quotaInMB) * 100,
      isSufficient: availableInMB > 50, // At least 50MB free
    };
  }
  
  // Fallback if Storage API not supported
  return {
    available: 100,
    quota: 512,
    percentageUsed: 0,
    isSufficient: true,
  };
}

/**
 * Check if book can be downloaded (enough space)
 */
export async function canDownloadBook(fileSizeMB: number): Promise<{
  canDownload: boolean;
  reason?: string;
}> {
  const { available, isSufficient } = await checkAvailableStorage();
  
  if (!isSufficient) {
    return {
      canDownload: false,
      reason: `Not enough storage space. Only ${available.toFixed(0)}MB available.`,
    };
  }
  
  if (available < fileSizeMB) {
    return {
      canDownload: false,
      reason: `Book size (${fileSizeMB}MB) exceeds available space (${available.toFixed(0)}MB).`,
    };
  }
  
  return { canDownload: true };
}