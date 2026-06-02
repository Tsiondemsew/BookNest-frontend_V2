'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/client';

export function BooksView() {
  const [status, setStatus] = useState('pending_review');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'books', status],
    queryFn: () => adminApi.listBooks({ status: status || undefined }),
  });

  const reviewMutation = useMutation({
    mutationFn: ({
      id,
      reviewStatus,
      review_note,
    }: {
      id: string;
      reviewStatus: string;
      review_note?: string;
    }) => adminApi.reviewBook(id, { status: reviewStatus, review_note }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'books'] }),
  });

  const books = data?.data?.books ?? [];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Book management</h1>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="mt-4 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
      >
        <option value="pending_review">Pending review</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
        <option value="draft">Draft</option>
      </select>
      <div className="mt-6 space-y-4">
        {isLoading && <p className="text-zinc-500">Loading books…</p>}
        {!isLoading && books.length === 0 && (
          <p className="text-zinc-500">No books in this status.</p>
        )}
        {books.map((book) => (
          <div
            key={book.id}
            className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium text-zinc-900">{book.title}</p>
              <p className="text-xs text-zinc-500 capitalize">Status: {book.status}</p>
            </div>
            {book.status === 'pending_review' && (
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-lg bg-green-700 px-3 py-1.5 text-sm text-white"
                  onClick={() =>
                    reviewMutation.mutate({ id: book.id, reviewStatus: 'approved' })
                  }
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white"
                  onClick={() =>
                    reviewMutation.mutate({
                      id: book.id,
                      reviewStatus: 'rejected',
                      review_note: 'Rejected by admin',
                    })
                  }
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
