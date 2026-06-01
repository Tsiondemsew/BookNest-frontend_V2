'use client';

import { useAuthStore } from '@/stores/authStore';
import { AuthorStudioProfileHub } from '@/features/studio/components/AuthorStudioProfileHub';

export default function AuthorStudioProfilePage() {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || (user?.role !== 'author' && user?.role !== 'publisher')) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500">Author or publisher access required.</p>
      </div>
    );
  }

  return <AuthorStudioProfileHub />;
}
