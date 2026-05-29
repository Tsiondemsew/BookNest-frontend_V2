'use client';

import { use } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { AuthorBookUploadForm, PublisherBookUploadForm } from '@/features/studio';
import Link from 'next/link';

export default function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500">Please login to edit books.</p>
      </div>
    );
  }

  if (user?.role !== 'author' && user?.role !== 'publisher') {
    return (
      <div className="text-center py-16">
        <p className="text-red-500">Only authors and publishers can edit books.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/studio/books"
        className="inline-block text-sm text-[#B85C38] hover:text-[#8E735B] mb-4"
      >
        ← Back to My Books
      </Link>
      {user?.role === 'publisher' ? (
        <PublisherBookUploadForm bookId={id} />
      ) : (
        <AuthorBookUploadForm bookId={id} />
      )}
    </div>
  );
}
