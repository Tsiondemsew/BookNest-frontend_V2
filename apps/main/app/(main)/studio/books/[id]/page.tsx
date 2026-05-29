'use client';

import { use } from 'react';
import Link from 'next/link';
import { useBookForEdit } from '@/features/studio/hooks/useBookForEdit';
import { Loader2 } from 'lucide-react';

export default function StudioBookPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: book, isLoading, isError } = useBookForEdit(id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-[#B85C38]" size={32} />
      </div>
    );
  }

  if (isError || !book) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500">Could not load book preview.</p>
        <Link href="/studio/books" className="text-[#B85C38] text-sm mt-2 inline-block">
          Back to My Books
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/studio/books" className="text-sm text-[#B85C38] hover:text-[#8E735B] mb-4 inline-block">
        ← My Books
      </Link>
      <div className="bg-white rounded-xl border border-[#E8E2D9] overflow-hidden shadow-sm">
        <img
          src={book.cover_image_url}
          alt={book.title}
          className="w-full h-56 object-cover"
        />
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-2xl font-bold text-[#1A2A3A]">{book.title}</h1>
            <span className="text-xs px-2 py-1 rounded-full bg-[#F5F1EB] text-[#4A5568] capitalize">
              {book.status.replace('_', ' ')}
            </span>
          </div>
          {book.subtitle && <p className="text-[#4A5568]">{book.subtitle}</p>}
          <p className="text-sm text-[#4A5568]">
            {book.author_name} · {book.language}
          </p>
          {book.description && (
            <p className="text-sm text-[#1A2A3A] whitespace-pre-wrap">{book.description}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {book.formats?.map((f) => (
              <span
                key={f.id}
                className="text-xs bg-[#F5F1EB] text-[#4A5568] px-2 py-1 rounded-md"
              >
                {f.format_type}: {f.price} ETB ({f.status || 'draft'})
              </span>
            ))}
          </div>
          <Link
            href={`/studio/books/${book.id}/edit`}
            className="inline-block px-4 py-2 bg-[#B85C38] text-white text-sm font-medium rounded-lg hover:bg-[#8E735B]"
          >
            Edit book
          </Link>
        </div>
      </div>
    </div>
  );
}
