'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { MyBooksList } from '@/features/studio/components/MyBooksList';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/hooks/useTranslation';

export default function MyBooksPage() {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const isPublisher = user?.role === 'publisher';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2A3A] bn-serif">
            {isPublisher ? t('studioDashboard.catalogTitle') : t('studioDashboard.myBooksTitle')}
          </h1>
          <p className="text-[#4A5568] mt-1">
            {isPublisher
              ? t('studioDashboard.catalogSubtitle')
              : t('studioDashboard.myBooksSubtitle')}
          </p>
        </div>
        <Link
          href="/studio/upload"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#B85C38] text-white rounded-xl text-sm font-medium hover:bg-[#A04E2F] transition-colors shadow-sm"
        >
          <Plus size={18} />
          {t('studioDashboard.uploadBook')}
        </Link>
      </div>
      <MyBooksList />
    </div>
  );
}
