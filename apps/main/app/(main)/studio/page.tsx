'use client';

import { useAuthStore } from '@/stores/authStore';
import { useSalesAnalytics } from '@/features/analytics/hooks/useAnalytics';
import { MyBooksList } from '@/features/studio/components/MyBooksList';
import Link from 'next/link';
import { Plus, BookOpen, DollarSign, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function StudioDashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const { data: analytics, isLoading: analyticsLoading } = useSalesAnalytics();
  const { t } = useTranslation();
  const isPublisher = user?.role === 'publisher';

  if (!isAuthenticated || (user?.role !== 'author' && user?.role !== 'publisher')) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500">{t('studioDashboard.accessDenied')}</p>
      </div>
    );
  }

  const summary = analytics?.summary;
  const totalBooks = summary?.total_books ?? 0;
  const totalCopiesSold = summary?.total_copies_sold ?? 0;
  const totalRevenue = summary?.total_revenue ?? 0;
  const pendingApproval = summary?.pending_approval ?? 0;
  const monthlyEarnings = summary?.monthly_earnings ?? 0;

  const stats = [
    {
      label: isPublisher ? t('studioAnalytics.catalogBooks') : t('studioDashboard.totalBooks'),
      value: analyticsLoading ? '...' : totalBooks,
      icon: BookOpen,
      color: '#2C3E50',
      bgColor: '#2C3E5010',
    },
    {
      label: t('studioDashboard.digitalSales'),
      value: analyticsLoading ? '...' : totalCopiesSold,
      icon: TrendingUp,
      color: '#2D6A4F',
      bgColor: '#2D6A4F10',
    },
    {
      label: t('studioDashboard.totalRevenue'),
      value: analyticsLoading ? '...' : `${totalRevenue} ETB`,
      icon: DollarSign,
      color: '#B85C38',
      bgColor: '#B85C3810',
    },
    
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2A3A] bn-serif">{t('studioDashboard.title')}</h1>
          <p className="text-[#4A5568] mt-1">
            {t('studioDashboard.welcomeBack', { name: user?.publicName || '' })}
          </p>
        </div>
        <Link
          href="/studio/upload"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#B85C38] text-white rounded-xl font-medium hover:bg-[#A04E2F] transition-colors shadow-sm"
        >
          <Plus size={18} />
          {t('studioDashboard.uploadNewBook')}
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl border border-[#E8E2D9] p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="p-2 rounded-lg w-fit" style={{ backgroundColor: stat.bgColor }}>
              <stat.icon size={20} style={{ color: stat.color }} />
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-[#1A2A3A] tabular-nums">{stat.value}</div>
              <div className="text-sm text-[#4A5568]">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {pendingApproval > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <AlertCircle size={20} className="text-amber-600 shrink-0" />
          <div className="flex-1">
            <p className="text-amber-800 font-medium">
              {t(
                pendingApproval === 1
                  ? 'studioDashboard.pendingApproval_one'
                  : 'studioDashboard.pendingApproval_other',
                { count: pendingApproval }
              )}
            </p>
            <p className="text-amber-700 text-sm">{t('studioDashboard.pendingApprovalHint')}</p>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-[#1A2A3A] mb-4">
          {isPublisher ? t('studioDashboard.catalogTitle') : t('studioDashboard.yourBooks')}
        </h2>
        <MyBooksList />
      </div>
    </div>
  );
}
