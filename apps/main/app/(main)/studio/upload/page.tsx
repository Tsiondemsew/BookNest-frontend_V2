'use client';

import { useAuthStore } from '@/stores/authStore';
import { AuthorBookUploadForm, PublisherBookUploadForm, BookUploadInfoCallout } from '@/features/studio';
import { useTranslation } from '@/hooks/useTranslation';

export default function UploadBookPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { t } = useTranslation();

  if (!isAuthenticated) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500">{t('studioDashboard.loginToUpload')}</p>
      </div>
    );
  }

  if (user?.role !== 'author' && user?.role !== 'publisher') {
    return (
      <div className="text-center py-16">
        <p className="text-red-500">{t('studioDashboard.uploadRestricted')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <BookUploadInfoCallout />
      {user?.role === 'publisher' ? <PublisherBookUploadForm /> : <AuthorBookUploadForm />}
    </div>
  );
}
