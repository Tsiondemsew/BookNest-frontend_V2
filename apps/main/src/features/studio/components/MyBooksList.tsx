'use client';

import Link from 'next/link';
import { Edit, Trash2, Eye, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useMyBooks, useDeleteBook } from '@/features/books/hooks/useMyBooks';

export function MyBooksList() {
  const { data, isLoading, isError } = useMyBooks();
  const deleteBook = useDeleteBook();
  
  const books = data?.books || [];
  const total = data?.pagination?.total || 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-4 p-4 bg-white rounded-xl border border-[#E8E2D9] animate-pulse">
            <div className="w-20 h-28 bg-[#E8E2D9] rounded-lg"></div>
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-[#E8E2D9] rounded w-1/3"></div>
              <div className="h-4 bg-[#E8E2D9] rounded w-1/4"></div>
              <div className="h-3 bg-[#E8E2D9] rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Failed to load your books</p>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-[#E8E2D9]">
        <p className="text-[#4A5568]">You haven't uploaded any books yet.</p>
        <Link
          href="/studio/upload"
          className="inline-block mt-4 px-4 py-2 bg-[#B85C38] text-white rounded-lg font-medium hover:bg-[#8E735B] transition-colors"
        >
          Upload Your First Book
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statuses: Record<string, { color: string; bg: string; text: string; icon: any }> = {
      draft: { color: '#4A5568', bg: '#F5F1EB', text: 'Draft', icon: Clock },
      pending_review: { color: '#D97706', bg: '#FEF3C7', text: 'Pending Review', icon: AlertCircle },
      approved: { color: '#2D6A4F', bg: '#D1FAE5', text: 'Approved', icon: CheckCircle },
      rejected: { color: '#DC2626', bg: '#FEE2E2', text: 'Rejected', icon: AlertCircle },
    };
    const s = statuses[status] || statuses.draft;
    const Icon = s.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium`} style={{ backgroundColor: s.bg, color: s.color }}>
        <Icon size={12} />
        {s.text}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-[#4A5568]">{total} book{total !== 1 ? 's' : ''} total</p>
      </div>
      
      <div className="space-y-4">
        {books.map((book) => (
          <div key={book.id} className="flex gap-4 p-4 bg-white rounded-xl border border-[#E8E2D9] shadow-sm hover:shadow-md transition-all">
            <img
              src={book.cover_image_url}
              alt={book.title}
              className="w-20 h-28 object-cover rounded-lg shadow-sm"
            />
            
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-[#1A2A3A] text-lg">{book.title}</h3>
                  <p className="text-sm text-[#4A5568]">{book.author_name}</p>
                </div>
                {getStatusBadge(book.status)}
              </div>
              
              {book.status === 'rejected' && (book as { review_note?: string }).review_note && (
                <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                  <strong>Rejection feedback:</strong>{' '}
                  {(book as { review_note?: string }).review_note}
                </p>
              )}

              <div className="mt-2 flex flex-wrap gap-2">
                {book.formats?.map((format) => (
                  <span key={format.format_type} className="text-xs bg-[#F5F1EB] text-[#4A5568] px-2 py-1 rounded-md">
                    {format.format_type}: {format.price} ETB
                  </span>
                ))}
              </div>
              
              <div className="mt-3 flex items-center gap-4">
                <Link
                  href={`/market/${book.id}`}
                  className="text-sm text-[#B85C38] hover:text-[#8E735B] transition-colors flex items-center gap-1"
                >
                  <Eye size={14} /> View
                </Link>
                <Link
                  href={`/studio/books/${book.id}/edit`}
                  className="text-sm text-[#4A5568] hover:text-[#1A2A3A] transition-colors flex items-center gap-1"
                >
                  <Edit size={14} /> Edit
                </Link>
                <button
                  onClick={() => deleteBook.mutate(book.id)}
                  disabled={deleteBook.isPending}
                  className="text-sm text-red-500 hover:text-red-600 transition-colors flex items-center gap-1 disabled:opacity-50"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}