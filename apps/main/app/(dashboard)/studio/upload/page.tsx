'use client';

import { useAuthStore } from '@/stores/authStore';
import { AuthorBookUploadForm, PublisherBookUploadForm } from '@/features/studio';

export default function UploadBookPage() {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500">Please login to upload books.</p>
      </div>
    );
  }

  if (user?.role !== 'author' && user?.role !== 'publisher') {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500">Only authors and publishers can upload books.</p>
      </div>
    );
  }

  if (user?.role === 'publisher') {
    return <PublisherBookUploadForm />;
  }

  return <AuthorBookUploadForm />;
}