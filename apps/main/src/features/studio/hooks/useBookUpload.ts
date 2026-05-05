'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Book } from '@repo/types';
import { apiClient } from '@/lib/api/client';

interface UseBookUploadOptions {
  onSuccess?: (book: Book) => void;
  onError?: (error: string) => void;
}

export function useBookUpload(options: UseBookUploadOptions = {}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadBook = async (formData: FormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await apiClient.post<{ success: boolean; data: Book; error?: { message?: string } }, FormData>(
        '/api/books/upload',
        formData,
      );

      if (!result?.success) {
        throw new Error(result?.error?.message || 'Failed to upload book');
      }

      options.onSuccess?.(result.data);
      router.push('/studio/books');
      return result.data;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to upload book';
      setError(errorMsg);
      options.onError?.(errorMsg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    uploadBook,
    isSubmitting,
    error,
    clearError: () => setError(null),
  };
}