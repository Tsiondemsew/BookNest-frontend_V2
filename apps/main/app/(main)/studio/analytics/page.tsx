'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Loader2,
  TrendingUp,
  BarChart3,
  Star,
  Heart,
  MessageSquare,
} from 'lucide-react';
import { analyticsApi } from '@/lib/api/client';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import type { BookPerformanceItem } from '@repo/types';

type ReportTab = 'sales' | 'performance' | 'reviews';

export default function StudioAnalyticsPage() {
  const [tab, setTab] = useState<ReportTab>('sales');
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const isPublisher = user?.role === 'publisher';

  const salesQuery = useQuery({
    queryKey: ['analytics', 'sales'],
    queryFn: () => analyticsApi.getSalesAnalytics(),
    enabled: tab === 'sales',
  });

  const performanceQuery = useQuery({
    queryKey: ['analytics', 'performance'],
    queryFn: () => analyticsApi.getBookPerformance(),
    enabled: tab === 'performance',
  });

  const reviewsQuery = useQuery({
    queryKey: ['analytics', 'reviews'],
    queryFn: () => analyticsApi.getSellerReviews({ limit: 50 }),
    enabled: tab === 'reviews',
  });

  const tabs: { id: ReportTab; label: string; icon: typeof TrendingUp }[] = [
    { id: 'sales', label: t('studioAnalytics.tabSales'), icon: TrendingUp },
    { id: 'performance', label: t('studioAnalytics.tabPerformance'), icon: BarChart3 },
    { id: 'reviews', label: t('studioAnalytics.tabReviews'), icon: MessageSquare },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2A3A] bn-serif">{t('studioAnalytics.title')}</h1>
          <p className="text-[#4A5568]">{t('studioAnalytics.subtitle')}</p>
        </div>
        <Link href="/studio/earnings" className="text-sm text-[#B85C38] hover:underline">
          {isPublisher ? t('studioAnalytics.linkPayouts') : t('studioAnalytics.linkEarnings')}
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-[#E8E2D9] pb-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
              tab === id
                ? 'bg-white border border-[#E8E2D9] border-b-white text-[#1A2A3A] -mb-px'
                : 'text-[#4A5568] hover:text-[#1A2A3A] hover:bg-[#F5F1EB]'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {tab === 'sales' && (
        <SalesTab
          data={salesQuery.data?.data}
          state={salesQuery}
          isPublisher={isPublisher}
        />
      )}
      {tab === 'performance' && (
        <PerformanceTab data={performanceQuery.data?.data} state={performanceQuery} />
      )}
      {tab === 'reviews' && <ReviewsTab data={reviewsQuery.data?.data} state={reviewsQuery} />}
    </div>
  );
}

function LoadingBlock() {
  return (
    <div className="flex justify-center py-20">
      <Loader2 className="animate-spin text-[#B85C38]" size={40} />
    </div>
  );
}

function ErrorBlock({ message }: { message: string }) {
  return <p className="text-red-500 p-6">{message}</p>;
}

function SalesTab({
  data,
  state,
  isPublisher,
}: {
  data:
    | {
        summary: {
          total_books: number;
          total_copies_sold: number;
          total_revenue: number;
          pending_approval: number;
        };
        sales_over_time: Array<{ date: string; sales: number; revenue: number }>;
        top_books: Array<{ book_id: string; title: string; copies_sold: number; revenue: number }>;
      }
    | undefined;
  state: { isLoading: boolean; isError: boolean };
  isPublisher: boolean;
}) {
  const { t } = useTranslation();

  if (state.isLoading) return <LoadingBlock />;
  if (state.isError || !data) return <ErrorBlock message={t('studioAnalytics.loadFailed')} />;

  const summary = data.summary;
  const chartDays = data.sales_over_time || [];
  const maxRevenue = Math.max(...chartDays.map((d) => d.revenue), 1);
  const hasSales = chartDays.some((d) => d.sales > 0);

  return (
    <div className="space-y-6">
      <p className="text-sm text-[#4A5568] rounded-lg bg-[#FDFBF7] border border-[#E8E2D9] px-4 py-3">
        {isPublisher ? t('studioAnalytics.grossSalesNote') : t('studioAnalytics.grossSalesNoteAuthor')}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('studioAnalytics.booksInCatalog'), value: summary.total_books },
          { label: t('studioAnalytics.digitalSales'), value: summary.total_copies_sold },
          {
            label: t('studioAnalytics.grossSalesEtb'),
            value: Number(summary.total_revenue).toFixed(2),
          },
          { label: t('studioAnalytics.pendingApproval'), value: summary.pending_approval },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-[#E8E2D9] rounded-xl p-4">
            <p className="text-2xl font-bold text-[#1A2A3A]">{s.value}</p>
            <p className="text-xs text-[#4A5568]">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#E8E2D9] rounded-xl p-6">
        <h2 className="font-semibold text-[#1A2A3A] mb-1 flex items-center gap-2">
          <TrendingUp size={18} /> {t('studioAnalytics.grossSales30Days')}
        </h2>
        <p className="text-xs text-[#4A5568] mb-4">{t('studioAnalytics.dailyPaymentsNote')}</p>
        <div className="flex items-end gap-0.5 h-48 border-b border-[#E8E2D9] pb-1">
          {chartDays.map((day) => {
            const heightPct = day.revenue > 0 ? Math.max(8, (day.revenue / maxRevenue) * 100) : 2;
            return (
              <div
                key={day.date}
                className="flex-1 flex flex-col items-center justify-end gap-1 min-w-0 h-full"
                title={`${day.date}: ${day.revenue} ETB · ${day.sales} sold`}
              >
                <div
                  className={`w-full rounded-t min-w-[3px] ${day.revenue > 0 ? 'bg-[#B85C38]' : 'bg-[#E8E2D9]'}`}
                  style={{ height: `${heightPct}%` }}
                />
                {chartDays.length <= 15 && (
                  <span className="text-[9px] text-[#4A5568] truncate w-full text-center">
                    {day.date.slice(8)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        {!hasSales && (
          <p className="text-[#4A5568] text-sm mt-3">{t('studioAnalytics.noSales30Days')}</p>
        )}
      </div>

      <div className="bg-white border border-[#E8E2D9] rounded-xl p-6">
        <h2 className="font-semibold text-[#1A2A3A] mb-4">{t('studioAnalytics.topSellers')}</h2>
        <ul className="space-y-3">
          {(data.top_books || []).map((b) => (
            <li key={b.book_id} className="flex justify-between text-sm border-b border-[#E8E2D9] pb-2">
              <span className="font-medium text-[#1A2A3A]">{b.title}</span>
              <span className="text-[#4A5568]">
                {t(b.copies_sold === 1 ? 'studioAnalytics.sale_one' : 'studioAnalytics.sale_other', {
                  count: b.copies_sold,
                })}{' '}
                · {Number(b.revenue).toFixed(2)} ETB
              </span>
            </li>
          ))}
          {!data.top_books?.length && (
            <p className="text-sm text-[#4A5568]">{t('studioAnalytics.noSalesYet')}</p>
          )}
        </ul>
      </div>
    </div>
  );
}

function PerformanceTab({
  data,
  state,
}: {
  data: {
    summary: {
      total_books: number;
      total_wishlists: number;
      total_reviews: number;
      avg_catalog_rating: number;
    };
    books: BookPerformanceItem[];
  } | undefined;
  state: { isLoading: boolean; isError: boolean };
}) {
  const { t } = useTranslation();

  if (state.isLoading) return <LoadingBlock />;
  if (state.isError || !data) return <ErrorBlock message={t('studioAnalytics.loadFailed')} />;

  const { summary, books } = data;
  const maxEngagement = Math.max(...books.map((b) => b.engagement_score), 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('studioAnalytics.catalogBooks'), value: summary.total_books, icon: BarChart3 },
          { label: t('studioAnalytics.wishlistAdds'), value: summary.total_wishlists, icon: Heart },
          {
            label: t('studioAnalytics.totalReviews'),
            value: summary.total_reviews,
            icon: MessageSquare,
          },
          {
            label: t('studioAnalytics.avgRating'),
            value: summary.avg_catalog_rating > 0 ? summary.avg_catalog_rating.toFixed(1) : '—',
            icon: Star,
          },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-[#E8E2D9] rounded-xl p-4">
            <s.icon size={18} className="text-[#B85C38] mb-2" />
            <p className="text-2xl font-bold text-[#1A2A3A]">{s.value}</p>
            <p className="text-xs text-[#4A5568]">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#E8E2D9] rounded-xl p-6">
        <h2 className="font-semibold text-[#1A2A3A] mb-2">
          {t('studioAnalytics.marketPerformanceTitle')}
        </h2>
        <p className="text-sm text-[#4A5568] mb-6">{t('studioAnalytics.marketScoreNote')}</p>

        {!books.length ? (
          <p className="text-sm text-[#4A5568]">{t('studioAnalytics.uploadForPerformance')}</p>
        ) : (
          <div className="space-y-4">
            {books.map((book) => (
              <div
                key={book.book_id}
                className="rounded-xl border border-[#E8E2D9] p-4 hover:bg-[#FDFBF7] transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-[#1A2A3A] truncate">{book.title}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#F5F1EB] text-[#4A5568] capitalize">
                        {book.status?.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-[#4A5568]">
                      <span>
                        {t(book.copies_sold === 1 ? 'studioAnalytics.sale_one' : 'studioAnalytics.sale_other', {
                          count: book.copies_sold,
                        })}
                      </span>
                      <span>{Number(book.revenue).toFixed(0)} ETB</span>
                      <span className="flex items-center gap-1">
                        <Star size={14} className="text-[#B85C38]" />
                        {book.review_count > 0 ? book.avg_rating.toFixed(1) : '—'} ({book.review_count})
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart size={14} /> {book.wishlist_count} {t('studioAnalytics.wishlists')}
                      </span>
                      <span>
                        {t('studioAnalytics.salesShare', {
                          percent: book.sales_share_percent,
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="md:w-48">
                    <div className="flex justify-between text-xs text-[#4A5568] mb-1">
                      <span>{t('studioAnalytics.marketScore')}</span>
                      <span>{book.engagement_score}/100</span>
                    </div>
                    <div className="h-2 bg-[#E8E2D9] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#2C3E50] to-[#B85C38] rounded-full"
                        style={{ width: `${(book.engagement_score / maxEngagement) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewsTab({
  data,
  state,
}: {
  data: {
    reviews: Array<{
      id: string;
      rating: number;
      body: string | null;
      book_title: string;
      book_id: string;
      reviewer_role: string;
      created_at: string;
      user: { display_name: string };
    }>;
    summary: { total_reviews: number; avg_rating: number };
  } | undefined;
  state: { isLoading: boolean; isError: boolean };
}) {
  const { t } = useTranslation();

  if (state.isLoading) return <LoadingBlock />;
  if (state.isError || !data) return <ErrorBlock message={t('studioAnalytics.loadFailed')} />;

  const { reviews, summary } = data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 max-w-md">
        <div className="bg-white border border-[#E8E2D9] rounded-xl p-4">
          <p className="text-2xl font-bold text-[#1A2A3A]">{summary.total_reviews}</p>
          <p className="text-xs text-[#4A5568]">{t('studioAnalytics.reviewsOnBooks')}</p>
        </div>
        <div className="bg-white border border-[#E8E2D9] rounded-xl p-4">
          <p className="text-2xl font-bold text-[#1A2A3A] flex items-center gap-1">
            {summary.avg_rating > 0 ? summary.avg_rating.toFixed(1) : '—'}
            <Star size={20} className="text-[#B85C38]" fill="#B85C38" />
          </p>
          <p className="text-xs text-[#4A5568]">{t('studioAnalytics.averageRating')}</p>
        </div>
      </div>

      <div className="bg-white border border-[#E8E2D9] rounded-xl divide-y divide-[#E8E2D9]">
        {!reviews.length ? (
          <p className="p-6 text-sm text-[#4A5568]">{t('studioAnalytics.noReviewsYet')}</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/market/${review.book_id}`}
                    className="text-sm font-semibold text-[#B85C38] hover:underline"
                  >
                    {review.book_title}
                  </Link>
                  <p className="text-xs text-[#4A5568] mt-0.5">
                    {review.user.display_name} · {review.reviewer_role} ·{' '}
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < review.rating ? 'text-[#B85C38]' : 'text-[#E8E2D9]'}
                      fill={i < review.rating ? '#B85C38' : 'transparent'}
                    />
                  ))}
                </div>
              </div>
              {review.body && (
                <p className="text-sm text-[#1A2A3A] mt-3 leading-relaxed">{review.body}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
