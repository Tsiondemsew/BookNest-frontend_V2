'use client';

import { useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { useBookUpload } from '../hooks/useBookUpload';
import { useToast } from '@/components/feedback';
import { useQueryClient } from '@tanstack/react-query';

interface AddFormatPanelProps {
  bookId: string;
  formatType: 'PDF' | 'Audio';
  onAdded?: () => void;
}

export function AddFormatPanel({ bookId, formatType, onAdded }: AddFormatPanelProps) {
  const [file, setFile] = useState<File | null>(null);
  const [price, setPrice] = useState('0');
  const { addBookFormat, isSubmitting } = useBookUpload();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    if (!file) {
      showToast(`Choose a ${formatType} file first`, 'error');
      return;
    }

    const formData = new FormData();
    if (formatType === 'PDF') {
      formData.append('pdf', file);
      formData.append('pdf_price', price);
    } else {
      formData.append('audio', file);
      formData.append('audio_price', price);
    }

    try {
      await addBookFormat(bookId, formData);
      showToast(`${formatType} added and sent for review`, 'success');
      queryClient.invalidateQueries({ queryKey: ['book-edit', bookId] });
      queryClient.invalidateQueries({ queryKey: ['my-books'] });
      setFile(null);
      onAdded?.();
    } catch {
      showToast(`Failed to add ${formatType}`, 'error');
    }
  };

  const accept =
    formatType === 'PDF'
      ? 'application/pdf,.pdf'
      : 'audio/mpeg,audio/mp3,audio/wav,audio/m4a';

  return (
    <div className="rounded-xl border border-dashed border-[#B85C38] bg-[#FDFBF7] p-4 space-y-3">
      <p className="text-sm font-medium text-[#1A2A3A]">
        Add {formatType} format (requires admin approval)
      </p>
      <div className="flex flex-wrap gap-3 items-end">
        <label className="flex-1 min-w-[200px] flex items-center gap-2 px-4 py-2.5 border border-[#E8E2D9] rounded-lg cursor-pointer bg-white">
          <Upload size={16} className="text-[#4A5568]" />
          <span className="text-sm text-[#4A5568] truncate">{file ? file.name : `Choose ${formatType} file`}</span>
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-28 px-3 py-2.5 border border-[#E8E2D9] rounded-lg text-sm"
          placeholder="Price"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-4 py-2.5 bg-[#B85C38] text-white text-sm font-medium rounded-lg hover:bg-[#8E735B] disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
          Add {formatType}
        </button>
      </div>
    </div>
  );
}
