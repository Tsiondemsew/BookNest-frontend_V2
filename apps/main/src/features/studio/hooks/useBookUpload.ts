'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Book } from '@repo/types';
import { booksApi } from '@/lib/api/client';
import { ConflictError } from '@repo/api-client';

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
      const result = await booksApi.uploadBook(formData);

      if (!result?.success) {
        throw new Error(result?.error?.message || 'Failed to upload book');
      }

      options.onSuccess?.(result.data);
      router.push('/studio/books');
      return result.data;
    } catch (err: unknown) {
      if (err instanceof ConflictError) throw err;
      const errorMsg = err instanceof Error ? err.message : 'Failed to upload book';
      setError(errorMsg);
      options.onError?.(errorMsg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitBookForReview = async (bookId: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await booksApi.submitBookForReview(bookId);

      if (!result?.success) {
        throw new Error(result?.error?.message || 'Failed to submit book for review');
      }

      options.onSuccess?.(result.data);
      return result.data;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to submit book for review';
      setError(errorMsg);
      options.onError?.(errorMsg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateUploadedBook = async (bookId: string, formData: FormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await booksApi.updateUploadedBook(bookId, formData);

      if (!result?.success) {
        throw new Error(result?.error?.message || 'Failed to update book');
      }

      options.onSuccess?.(result.data);
      router.push('/studio/books');
      return result.data;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to update book';
      setError(errorMsg);
      options.onError?.(errorMsg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const addBookFormat = async (bookId: string, formData: FormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await booksApi.addBookFormat(bookId, formData);

      if (!result?.success) {
        throw new Error(result?.error?.message || 'Failed to add format');
      }

      return result.data;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to add format';
      setError(errorMsg);
      options.onError?.(errorMsg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    uploadBook,
    updateUploadedBook,
    addBookFormat,
    submitBookForReview,
    isSubmitting,
    error,
    clearError: () => setError(null),
  };
}