'use client';

import { useState } from 'react';
import { Download, CheckCircle, Trash2, Loader2 } from 'lucide-react';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';

interface DownloadButtonProps {
  bookFormatId: string;
  title: string;
  formatType: 'PDF' | 'Audio'; 
  fileSizeMB: number;
  variant?: 'icon' | 'full';
}

export function DownloadButton({ 
  bookFormatId, 
  title, 
  formatType,  
  fileSizeMB,
  variant = 'icon'
}: DownloadButtonProps) {
  const { downloadBook, removeBook, isDownloaded, isDownloading, storageInfo } = useOfflineStorage();
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCurrentlyDownloaded = isDownloaded(bookFormatId);
  const isBusy = isDownloading[bookFormatId];

  const handleDownload = async () => {
    setError(null);
    
    if (!storageInfo.isSufficient) {
      setError(`Not enough storage. Only ${storageInfo.available}MB available.`);
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    const result = await downloadBook(bookFormatId, title, formatType, fileSizeMB);
    if (result && typeof result === 'object' && 'success' in result) {
      if (!result.success) {
        setError(result.error || 'Download failed. Please try again.');
        setTimeout(() => setError(null), 4000);
      }
      return;
    }

    // Backward compatibility: downloadBook may return boolean
    if (result === false) {
      setError('Download failed. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleRemove = async () => {
    await removeBook(bookFormatId);
    setShowConfirm(false);
  };

  if (isCurrentlyDownloaded) {
    if (variant === 'full') {
      return (
        <div className="flex items-center gap-2">
          <span className="text-xs text-green-600 flex items-center gap-1">
            <CheckCircle size={12} />
            Downloaded
          </span>
          <button
            onClick={() => setShowConfirm(true)}
            className="text-xs text-red-500 hover:text-red-700"
          >
            Remove
          </button>
          {showConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-4 max-w-sm mx-4">
                <p className="text-sm mb-4">Remove "{title}" from offline storage?</p>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowConfirm(false)} className="px-3 py-1 text-sm border rounded">Cancel</button>
                  <button onClick={handleRemove} className="px-3 py-1 text-sm bg-red-500 text-white rounded">Remove</button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="p-1.5 text-green-600 hover:text-red-500 transition-colors"
        title="Remove from offline"
      >
        <CheckCircle size={16} />
      </button>
    );
  }

  if (variant === 'full') {
    return (
      <div>
        <button
          onClick={handleDownload}
          disabled={isBusy}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50"
        >
          {isBusy ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Download size={12} />
          )}
          Download for offline
        </button>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isBusy}
      className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50"
      title="Download for offline reading"
    >
      {isBusy ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Download size={16} />
      )}
    </button>
  );
}