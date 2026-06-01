'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  BooksListResponse,
  FilterTab,
  PendingBook,
  QueueStats,
  QueueStatus,
  RejectPayload,
  SortOption,
} from '@/features/books/types';
import { getApiErrorMessage } from '@/lib/api-error';

interface UseApprovalBooksOptions {
  status: QueueStatus;
  search?: string;
  page?: number;
  limit?: number;
  type?: FilterTab;
  sort?: SortOption;
  autoRefreshMs?: number;
  onNewPending?: (count: number, latestTitle?: string) => void;
}

function parseBooksListPayload(payload: BooksListResponse & { error?: { message?: string } }) {
  const data = payload.data as
    | { items?: PendingBook[]; books?: PendingBook[]; pagination?: { total: number; totalPages: number } }
    | PendingBook[]
    | undefined;

  if (Array.isArray(data)) {
    return { items: data, total: data.length, totalPages: 1 };
  }

  const items = data?.items ?? data?.books ?? [];
  const pagination = data?.pagination;
  return {
    items,
    total: pagination?.total ?? items.length,
    totalPages: pagination?.totalPages ?? 1,
  };
}

export function useApprovalBooks(options: UseApprovalBooksOptions) {
  const {
    status,
    search = '',
    page = 1,
    limit = 10,
    type = 'all',
    sort = 'newest',
    autoRefreshMs,
    onNewPending,
  } = options;

  const knownIdsRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);

  const [books, setBooks] = useState<PendingBook[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<QueueStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    reviewedToday: 0,
    resubmitted: 0,
    totalBooks: 0,
    totalAuthors: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/books/queue/stats', { credentials: 'include' });
      const payload = await res.json();
      if (res.ok && payload.success) {
        setStats(payload.data);
      }
    } catch {
      /* optional */
    }
  }, []);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sort,
        status,
      });

      if (search.trim()) {
        params.set('search', search.trim());
        params.set('q', search.trim());
      }
      if (status === 'pending_review' && type !== 'all') {
        params.set('type', type);
      }

      const res = await fetch(`/api/admin/books/by-status?${params}`, { credentials: 'include' });
      const payload = (await res.json()) as BooksListResponse & {
        error?: { message?: string };
      };

      if (!res.ok || !payload.success) {
        throw new Error(getApiErrorMessage(payload, 'Failed to load books'));
      }

      const { items, total: itemTotal, totalPages: pages } = parseBooksListPayload(payload);

      if (status === 'pending_review' && onNewPending) {
        const newOnes = items.filter((b) => !knownIdsRef.current.has(b.id));
        if (initializedRef.current && newOnes.length > 0) {
          onNewPending(newOnes.length, newOnes[0]?.title);
        }
        knownIdsRef.current = new Set(items.map((b) => b.id));
        initializedRef.current = true;
      }

      setBooks(items);
      setTotal(itemTotal);
      setTotalPages(pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load books');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [status, page, limit, search, type, sort, onNewPending]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  useEffect(() => {
    if (!autoRefreshMs || status !== 'pending_review') return;
    const id = setInterval(() => {
      fetchBooks();
      fetchStats();
    }, autoRefreshMs);
    return () => clearInterval(id);
  }, [autoRefreshMs, status, fetchBooks, fetchStats]);

  const fetchBookDetail = async (id: string) => {
    const res = await fetch(`/api/admin/books/${id}`, { credentials: 'include' });
    const payload = await res.json();
    if (!res.ok || !payload.success) {
      throw new Error(getApiErrorMessage(payload, 'Failed to load book detail'));
    }
    return payload.data as PendingBook;
  };

  const approveBook = async (
    id: string,
    options?: { skipValidation?: boolean; approveChanges?: boolean; skipContent?: boolean },
  ) => {
    const res = await fetch(`/api/admin/books/${id}/approve`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        skipValidation: options?.skipValidation === true,
        approveChanges: options?.approveChanges === true,
        skipContent: options?.skipContent === true,
      }),
    });
    const payload = await res.json();
    if (!res.ok || !payload.success) {
      throw new Error(getApiErrorMessage(payload, 'Failed to approve'));
    }
    await Promise.all([fetchBooks(), fetchStats()]);
    return payload;
  };

  const rejectBook = async (id: string, body: RejectPayload, options?: { notify?: boolean }) => {
    const res = await fetch(`/api/admin/books/${id}/reject`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, notify: options?.notify === true }),
    });
    const payload = await res.json();
    if (!res.ok || !payload.success) {
      throw new Error(getApiErrorMessage(payload, 'Failed to reject'));
    }
    await Promise.all([fetchBooks(), fetchStats()]);
    return payload;
  };

  const notifyAuthor = async (id: string, body: RejectPayload) => {
    const res = await fetch(`/api/admin/books/${id}/notify-author`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const payload = await res.json();
    if (!res.ok || !payload.success) {
      throw new Error(getApiErrorMessage(payload, 'Failed to notify author'));
    }
    await Promise.all([fetchBooks(), fetchStats()]);
    return payload;
  };

  const revertApproval = async (id: string) => {
    const res = await fetch(`/api/admin/books/${id}/revert-approval`, {
      method: 'POST',
      credentials: 'include',
    });
    const payload = await res.json();
    if (!res.ok || !payload.success) {
      throw new Error(payload.error?.message || 'Failed to revert approval');
    }
    await Promise.all([fetchBooks(), fetchStats()]);
    return payload;
  };

  return {
    books,
    total,
    totalPages,
    stats,
    loading,
    error,
    refetch: fetchBooks,
    fetchBookDetail,
    approveBook,
    rejectBook,
    notifyAuthor,
    revertApproval,
  };
}
