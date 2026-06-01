'use client';

import Link from 'next/link';
import {
  BookOpen,
  CheckCircle,
  Download,
  Headphones,
  Loader2,
  WifiOff,
} from 'lucide-react';
import { LibraryReviewButton } from '@/features/reviews/components/LibraryReviewButton';
import { useTranslation } from '@/hooks/useTranslation';

export interface LibraryBookCardItem {
  id: string;
  purchased_at: string;
  book: {
    id: string;
    title: string;
    author_name: string;
    cover_image_url: string;
  };
  format: {
    id: string;
    type: 'PDF' | 'Audio';
    file_size_bytes?: number | null;
  };
}

interface LibraryBookCardProps {
  item: LibraryBookCardItem;
  progress: number;
  isDownloaded: boolean;
  isDownloading: boolean;
  isOffline: boolean;
  onDownload: () => void;
  onRemoveOffline: () => void;
  onReviewClick: (bookId: string, bookTitle: string) => void;
}

export function LibraryBookCard({
  item,
  progress,
  isDownloaded,
  isDownloading,
  isOffline,
  onDownload,
  onRemoveOffline,
  onReviewClick,
}: LibraryBookCardProps) {
  const { t } = useTranslation();
  const readerHref = `/reader/${item.book.id}?format_id=${item.format.id}`;
  const isComplete = progress === 100;
  const inProgress = progress > 0 && progress < 100;

  return (
    <article className="group flex flex-col h-full bg-white rounded-2xl border border-[#E8E2D9] shadow-sm hover:shadow-md hover:border-[#B85C38]/25 transition-all duration-200">
      <Link href={readerHref} className="block relative">
        <div className="aspect-[2/3] relative overflow-hidden rounded-t-2xl bg-[#F5F1EB]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.book.cover_image_url}
            alt={item.book.title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          />
          <div className="absolute inset-x-0 top-0 p-2.5 flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1.5">
              {isDownloaded && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide bg-emerald-600/95 text-white px-2 py-1 rounded-md shadow-sm">
                  <CheckCircle size={10} />
                  {t('common.offline')}
                </span>
              )}
              {isOffline && !isDownloaded && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide bg-amber-500/95 text-white px-2 py-1 rounded-md shadow-sm">
                  <WifiOff size={10} />
                  {t('common.onlineOnly')}
                </span>
              )}
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-white/95 backdrop-blur-sm text-[#2C3E50] px-2 py-1 rounded-md shadow-sm">
              {item.format.type === 'PDF' ? <BookOpen size={11} /> : <Headphones size={11} />}
              {item.format.type}
            </span>
          </div>
          {(inProgress || isComplete) && (
            <div className="absolute inset-x-0 bottom-0 h-1 bg-black/10">
              <div
                className={`h-full transition-all ${isComplete ? 'bg-emerald-500' : 'bg-[#B85C38]'}`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-col flex-1 p-4">
        <Link href={readerHref} className="block min-w-0">
          <h3 className="font-semibold text-[#1A2A3A] text-sm sm:text-base line-clamp-2 leading-snug group-hover:text-[#B85C38] transition-colors bn-serif">
            {item.book.title}
          </h3>
          <p className="text-xs sm:text-sm text-[#4A5568] mt-1 line-clamp-1">{item.book.author_name}</p>
        </Link>

        {inProgress && (
          <div className="mt-3">
            <div className="flex justify-between text-[11px] text-[#4A5568] mb-1">
              <span>{t('common.progress')}</span>
              <span className="tabular-nums font-medium">{progress}%</span>
            </div>
            <div className="w-full bg-[#E8E2D9] rounded-full h-1.5">
              <div
                className="bg-[#B85C38] h-1.5 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {isComplete && (
          <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
            <CheckCircle size={12} />
            {t('common.finished')}
          </p>
        )}

        <div className="mt-auto pt-4 flex items-center gap-2">
          <Link
            href={readerHref}
            className="flex-1 inline-flex items-center justify-center px-3 py-2 rounded-xl bg-[#2C3E50] text-white text-xs sm:text-sm font-semibold hover:bg-[#1A2A3A] transition-colors"
          >
            {isComplete
              ? t('library.readAgain')
              : inProgress
                ? t('library.continue')
                : t('library.startReading')}
          </Link>

          {isDownloaded ? (
            <button
              type="button"
              onClick={onRemoveOffline}
              className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
              title={t('library.removeOffline')}
            >
              <CheckCircle size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={onDownload}
              disabled={isDownloading}
              className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-[#E8E2D9] bg-[#FDFBF7] text-[#4A5568] hover:border-[#B85C38]/30 hover:text-[#B85C38] transition-colors disabled:opacity-50"
              title={t('library.downloadOffline')}
            >
              {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            </button>
          )}

          {isComplete && (
            <LibraryReviewButton
              bookId={item.book.id}
              bookTitle={item.book.title}
              onReviewClick={onReviewClick}
              className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-[#E8E2D9] bg-[#FDFBF7] text-[#B85C38] hover:border-[#B85C38]/30 hover:bg-[#B85C38]/5 transition-colors"
              iconOnly
            />
          )}
        </div>

        <p className="mt-2 text-[10px] text-[#4A5568]/80">
          {t('library.addedOn', {
            date: new Date(item.purchased_at).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
          })}
        </p>
      </div>
    </article>
  );
}
