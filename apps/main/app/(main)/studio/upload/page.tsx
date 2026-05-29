'use client';

import { useAuthStore } from '@/stores/authStore';
import { AuthorBookUploadForm, PublisherBookUploadForm, BookUploadInfoCallout } from '@/features/studio';

export default function UploadBookPage() {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500">Please login to upload books.</p>
      </div>
    );
  }

  if (user?.role !== 'author' && user?.role !== 'publisher') {
    return (
      <div className="text-center py-16">
        <p className="text-red-500">Only authors and publishers can upload books.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <BookUploadInfoCallout />
      {user?.role === 'publisher' ? <PublisherBookUploadForm /> : <AuthorBookUploadForm />}
    </div>
  );
}