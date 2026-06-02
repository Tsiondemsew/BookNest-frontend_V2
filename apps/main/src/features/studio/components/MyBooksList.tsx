'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Edit, Trash2, AlertCircle, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { useMyBooks, useDeleteBook } from '@/features/books/hooks/useMyBooks';
import { useBookUpload } from '@/features/studio/hooks/useBookUpload';
import { ConfirmDialog } from '@/components/feedback';
import { useToast } from '@/components/feedback';
import { useTranslation } from '@/hooks/useTranslation';

export function MyBooksList() {
  const { data, isLoading, isError } = useMyBooks();
  const deleteBook = useDeleteBook();
  const { submitBookForReview, isSubmitting } = useBookUpload();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const books = data?.books || [];
  const total = data?.pagination?.total || 0;

  const handleSubmit = async (bookId: string) => {
    try {
      await submitBookForReview(bookId);
      showToast(t('studioDashboard.submittedForReview'), 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('studioDashboard.submitFailed');
      showToast(message, 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBook.mutateAsync(deleteTarget.id);
      showToast(t('studioDashboard.deleted'), 'success');
      setDeleteTarget(null);
    } catch {
      showToast(t('studioDashboard.deleteFailed'), 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="flex gap-4 p-4 bg-white rounded-xl border border-[#E8E2D9] animate-pulse"
          >
            <div className="w-20 h-28 bg-[#E8E2D9] rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-[#E8E2D9] rounded w-1/3" />
              <div className="h-4 bg-[#E8E2D9] rounded w-1/4" />
              <div className="h-3 bg-[#E8E2D9] rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{t('studioDashboard.loadFailed')}</p>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-[#E8E2D9]">
        <p className="text-[#4A5568]">{t('studioDashboard.emptyBooks')}</p>
        <Link
          href="/studio/upload"
          className="inline-block mt-4 px-4 py-2.5 bg-[#B85C38] text-white rounded-xl font-medium hover:bg-[#A04E2F] transition-colors"
        >
          {t('studioDashboard.uploadFirstBook')}
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statuses: Record<string, { color: string; bg: string; labelKey: string; icon: typeof Clock }> = {
      draft: { color: '#4A5568', bg: '#F5F1EB', labelKey: 'studioDashboard.statusDraft', icon: Clock },
      pending_review: {
        color: '#D97706',
        bg: '#FEF3C7',
        labelKey: 'studioDashboard.statusPendingReview',
        icon: AlertCircle,
      },
      approved: {
        color: '#2D6A4F',
        bg: '#D1FAE5',
        labelKey: 'studioDashboard.statusApproved',
        icon: CheckCircle,
      },
      rejected: {
        color: '#DC2626',
        bg: '#FEE2E2',
        labelKey: 'studioDashboard.statusRejected',
        icon: AlertCircle,
      },
    };
    const s = statuses[status] || statuses.draft;
    const Icon = s.icon;
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
        style={{ backgroundColor: s.bg, color: s.color }}
      >
        <Icon size={12} />
        {t(s.labelKey)}
      </span>
    );
  };

  return (
    <>
      <div className="space-y-4">
        <p className="text-sm text-[#4A5568]">
          {t(total === 1 ? 'studioDashboard.booksTotal_one' : 'studioDashboard.booksTotal_other', {
            count: total,
          })}
        </p>

        <div className="space-y-4">
          {books.map((book) => (
            <div
              key={book.id}
              className="flex gap-4 p-4 bg-white rounded-xl border border-[#E8E2D9] shadow-sm hover:shadow-md transition-all"
            >
              <img
                src={book.cover_image_url}
                alt={book.title}
                className="w-20 h-28 object-cover rounded-lg shadow-sm shrink-0"
              />

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[#1A2A3A] text-lg truncate">{book.title}</h3>
                    <p className="text-sm text-[#4A5568]">{book.author_name}</p>
                  </div>
                  {getStatusBadge(book.status)}
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                  {book.formats?.map((format) => (
                    <span
                      key={format.format_type}
                      className="text-xs bg-[#F5F1EB] text-[#4A5568] px-2 py-1 rounded-md"
                    >
                      {format.format_type}: {format.price} ETB
                      {format.is_active === false ? ` ${t('studioDashboard.formatPending')}` : ''}
                    </span>
                  ))}
                </div>

                <div className="mt-3 flex items-center gap-4 flex-wrap">
                  {(book.status === 'draft' || book.status === 'rejected') && (
                    <button
                      type="button"
                      onClick={() => handleSubmit(book.id)}
                      disabled={isSubmitting}
                      className="text-sm text-[#2C3E50] hover:text-[#1A2A3A] transition-colors flex items-center gap-1 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <AlertCircle size={14} />
                      )}
                      {t('studioDashboard.submit')}
                    </button>
                  )}
                  <Link
                    href={`/studio/books/${book.id}`}
                    className="text-sm text-[#4A5568] hover:text-[#1A2A3A] transition-colors"
                  >
                    {t('studioDashboard.view')}
                  </Link>
                  <Link
                    href={`/studio/books/${book.id}/edit`}
                    className="text-sm text-[#4A5568] hover:text-[#1A2A3A] transition-colors flex items-center gap-1"
                  >
                    <Edit size={14} /> {t('studioDashboard.edit')}
                  </Link>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget({ id: book.id, title: book.title })}
                    disabled={deleteBook.isPending}
                    className="text-sm text-red-500 hover:text-red-600 transition-colors flex items-center gap-1 disabled:opacity-50"
                  >
                    <Trash2 size={14} /> {t('studioDashboard.delete')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('studioDashboard.deleteTitle')}
        description={t('studioDashboard.deleteDescription', { title: deleteTarget?.title || '' })}
        confirmLabel={t('studioDashboard.deleteConfirm')}
        cancelLabel={t('studioDashboard.deleteCancel')}
        destructive
        isLoading={deleteBook.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
