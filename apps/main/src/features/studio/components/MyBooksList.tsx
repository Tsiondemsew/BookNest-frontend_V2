'use client';

import Link from 'next/link';
import { Edit, Trash2, Eye } from 'lucide-react';
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
          <div key={i} className="flex gap-4 p-4 bg-gray-100 rounded-lg animate-pulse">
            <div className="w-20 h-28 bg-gray-200 rounded"></div>
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="text-red-500">Failed to load your books</p>;
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">You haven't uploaded any books yet.</p>
        <Link
          href="/studio/upload"
          className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Upload Your First Book
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statuses: Record<string, { color: string; text: string }> = {
      draft: { color: 'bg-gray-100 text-gray-800', text: 'Draft' },
      pending_review: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending Review' },
      approved: { color: 'bg-green-100 text-green-800', text: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' },
    };
    const s = statuses[status] || statuses.draft;
    return <span className={`px-2 py-1 rounded-full text-xs ${s.color}`}>{s.text}</span>;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">My Books ({total})</h2>
        <Link
          href="/studio/upload"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Upload New Book
        </Link>
      </div>
      
      <div className="space-y-4">
        {books.map((book) => (
          <div key={book.id} className="flex gap-4 p-4 bg-white border rounded-lg shadow-sm">
            <img
              src={book.cover_image_url}
              alt={book.title}
              className="w-20 h-28 object-cover rounded"
            />
            
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{book.title}</h3>
                  <p className="text-sm text-gray-600">{book.author_name}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(book.status)}
                </div>
              </div>
              
              <div className="mt-2 flex flex-wrap gap-2">
                {book.formats?.map((format) => (
                  <span key={format.format_type} className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {format.format_type}: {format.price} ETB
                  </span>
                ))}
              </div>
              
              <div className="mt-3 flex items-center gap-3">
                <Link
                  href={`/market/${book.id}`}
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Eye size={14} /> View
                </Link>
                <Link
                  href={`/studio/books/${book.id}/edit`}
                  className="text-sm text-gray-600 hover:underline flex items-center gap-1"
                >
                  <Edit size={14} /> Edit
                </Link>
                <button
                  onClick={() => deleteBook.mutate(book.id)}
                  disabled={deleteBook.isPending}
                  className="text-sm text-red-600 hover:underline flex items-center gap-1 disabled:opacity-50"
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