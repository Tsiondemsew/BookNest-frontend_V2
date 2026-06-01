'use client';

import { use } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { AuthorBookSubmissionView } from '@/features/studio/components/AuthorBookSubmissionView';

type Props = {
  params: Promise<{ id: string }>;
};

export default function AuthorBookSubmissionPage({ params }: Props) {
  const { id } = use(params);
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || (user?.role !== 'author' && user?.role !== 'publisher')) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500">Author or publisher access required.</p>
      </div>
    );
  }

  return <AuthorBookSubmissionView bookId={id} />;
}
