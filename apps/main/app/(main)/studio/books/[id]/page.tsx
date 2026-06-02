'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Loader2, BookOpen, Headphones } from 'lucide-react';
import { useBookForEdit } from '@/features/studio/hooks/useBookForEdit';
import { StudioFilePreview } from '@/features/studio/components/StudioFilePreview';
import type { BookFormat } from '@repo/types';

export default function StudioBookPreviewPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: book, isLoading, isError } = useBookForEdit(id);
  const [activeFormatId, setActiveFormatId] = useState<string | null>(null);

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

  const formats = (book.formats || []).filter((f) => f.storage_path);
  const selectedFormat: BookFormat | undefined =
    formats.find((f) => f.id === activeFormatId) ?? formats[0];

  return (
    <div className="max-w-4xl mx-auto">
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
                {f.format_type}: {f.price} ETB
                {!f.storage_path ? ' (no file)' : ''}
                {f.is_active === false ? ' · pending' : ''}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <Link
              href={`/studio/books/${book.id}/edit`}
              className="inline-block px-4 py-2 bg-[#B85C38] text-white text-sm font-medium rounded-lg hover:bg-[#8E735B]"
            >
              Edit book
            </Link>
            {book.status === 'approved' && (
              <Link
                href={`/market/${book.id}`}
                className="inline-block px-4 py-2 border border-[#E8E2D9] text-[#1A2A3A] text-sm font-medium rounded-lg hover:border-[#B85C38]/40"
              >
                Open in marketplace
              </Link>
            )}
          </div>
        </div>
      </div>

      {formats.length > 0 && (
        <section className="mt-8 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-[#1A2A3A]">Review your files</h2>
            <p className="text-sm text-[#4A5568] mt-1">
              Open each format below to confirm the PDF or audio matches what you uploaded.
            </p>
          </div>

          {formats.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {formats.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveFormatId(f.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    (selectedFormat?.id === f.id)
                      ? 'bg-[#B85C38] text-white border-[#B85C38]'
                      : 'bg-white text-[#4A5568] border-[#E8E2D9] hover:border-[#B85C38]/40'
                  }`}
                >
                  {f.format_type === 'PDF' ? <BookOpen size={14} /> : <Headphones size={14} />}
                  {f.format_type}
                </button>
              ))}
            </div>
          )}

          {selectedFormat && (
            <StudioFilePreview
              key={selectedFormat.id}
              formatId={selectedFormat.id}
              formatType={selectedFormat.format_type}
              title={
                selectedFormat.format_type === 'PDF'
                  ? 'PDF preview'
                  : 'Audio preview'
              }
            />
          )}
        </section>
      )}

      {formats.length === 0 && (
        <p className="mt-6 text-sm text-[#4A5568]">
          No PDF or audio file uploaded yet. Add a format on the edit page to preview it here.
        </p>
      )}
    </div>
  );
}
