'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { ReadingJourneyView } from '@/features/reading-journey';
import { Loader2, Library } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

function isReaderRole(role?: string) {
  return role !== 'author' && role !== 'publisher';
}

export default function ReadingJourneyPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const role = user?.role;
  const { t } = useTranslation();

  useEffect(() => {
    if (user && !isReaderRole(role)) {
      router.replace('/studio');
    }
  }, [user, role, router]);

  if (!user) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-[#B85C38]" size={40} />
      </div>
    );
  }

  if (!isReaderRole(role)) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4">
        <p className="text-[#1A2A3A] font-semibold text-lg bn-serif">{t('reading.readersOnly')}</p>
        <p className="text-sm text-[#4A5568] mt-2">{t('reading.readersOnlyDesc')}</p>
        <Link
          href="/studio/analytics"
          className="inline-block mt-6 text-sm font-semibold text-[#B85C38] hover:text-[#8E735B]"
        >
          {t('reading.goToStudio')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2A3A] bn-serif">{t('pages.readingJourney')}</h1>
          <p className="text-sm text-[#4A5568] mt-1">{t('reading.subtitle')}</p>
        </div>
        <Link
          href="/library"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E8E2D9] bg-white text-sm font-medium text-[#2C3E50] hover:border-[#B85C38]/30 hover:bg-[#FDFBF7] transition-colors w-fit"
        >
          <Library size={16} className="text-[#B85C38]" />
          {t('pages.myLibrary')}
        </Link>
      </div>
      <ReadingJourneyView />
    </div>
  );
}
