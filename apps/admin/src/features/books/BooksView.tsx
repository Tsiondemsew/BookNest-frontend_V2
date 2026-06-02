'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  Headphones,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
} from 'lucide-react';
import type { AdminBookRow } from '@repo/api-client';
import { adminApi } from '@/lib/api/client';
import { AdminBadge, AdminButton, AdminCard, AdminInput } from '@/components/ui/AdminUi';
import { BookReviewModal } from './BookReviewModal';
import {
  BOOK_STATUS_TABS,
  bookStatusTone,
  formatBookStatus,
  minBookPrice,
} from './bookUtils';

function FormatTags({ book }: { book: AdminBookRow }) {
  const hasPdf = book.formats.some((f) => f.format_type === 'PDF');
  const hasAudio = book.formats.some((f) => f.format_type === 'Audio');

  if (!hasPdf && !hasAudio) {
    return <span className="text-xs text-[#4A5568]">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {hasPdf && (
        <span className="inline-flex items-center gap-0.5 text-[10px] font-medium bg-[#F5F1EB] text-[#2C3E50] px-1.5 py-0.5 rounded-md">
          <BookOpen size={10} />
          PDF
        </span>
      )}
      {hasAudio && (
        <span className="inline-flex items-center gap-0.5 text-[10px] font-medium bg-[#F5F1EB] text-[#2C3E50] px-1.5 py-0.5 rounded-md">
          <Headphones size={10} />
          Audio
        </span>
      )}
    </div>
  );
}

export function BooksView() {
  const [statusFilter, setStatusFilter] = useState('');
  const [q, setQ] = useState('');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'books', statusFilter, q],
    queryFn: () =>
      adminApi.listBooks({
        status: statusFilter || undefined,
        q: q || undefined,
      }),
  });

  const { data: dashboardData } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminApi.getDashboard(),
  });

  const { data: bookDetail, isLoading: detailLoading } = useQuery({
    queryKey: ['admin', 'books', 'detail', selectedBookId],
    queryFn: () => adminApi.getBook(selectedBookId!),
    enabled: Boolean(selectedBookId),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, reviewStatus }: { id: string; reviewStatus: string }) =>
      adminApi.reviewBook(id, { status: reviewStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'books'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      setSelectedBookId(null);
    },
  });

  const books = data?.data?.books ?? [];
  const selectedBook = bookDetail?.data ?? null;
  const pendingCount = dashboardData?.data?.pending_books ?? 0;

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const b of books) {
      counts[b.status] = (counts[b.status] ?? 0) + 1;
    }
    return counts;
  }, [books]);

  const handleApprove = () => {
    if (!selectedBookId) return;
    reviewMutation.mutate({ id: selectedBookId, reviewStatus: 'approved' });
  };

  const handleReject = () => {
    if (!selectedBookId) return;
    reviewMutation.mutate({ id: selectedBookId, reviewStatus: 'rejected' });
  };

  const tabIcons: Record<string, React.ReactNode> = {
    '': <BookOpen size={14} />,
    pending_review: <Clock size={14} />,
    approved: <CheckCircle2 size={14} />,
    rejected: <XCircle size={14} />,
  };

  const openDetail = (book: AdminBookRow) => setSelectedBookId(book.id);

  return (
    <div className="max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A2A3A]">Books</h1>
          <p className="mt-1 text-sm text-[#4A5568]">
            Review submissions and manage the catalog.
            {pendingCount > 0 && (
              <span className="ml-1 text-[#B85C38] font-medium">
                {pendingCount} awaiting review
              </span>
            )}
          </p>
        </div>
        <div className="relative max-w-xs w-full">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A5568]"
          />
          <AdminInput
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title or author…"
            className="pl-9"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {BOOK_STATUS_TABS.map((tab) => {
          const active = statusFilter === tab.value;
          const count =
            tab.value === ''
              ? undefined
              : tab.value === 'pending_review' && statusFilter !== tab.value
                ? pendingCount
                : statusFilter === tab.value
                  ? tabCounts[tab.value]
                  : undefined;

          return (
            <button
              key={tab.value || 'all'}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'bg-[#2C3E50] text-white shadow-sm'
                  : 'bg-white border border-[#E8E2D9] text-[#4A5568] hover:border-[#B85C38]/40 hover:text-[#1A2A3A]'
              }`}
            >
              {tabIcons[tab.value]}
              {tab.label}
              {count != null && count > 0 && (
                <span
                  className={`ml-0.5 min-w-[1.25rem] text-center text-xs rounded-full px-1.5 py-0.5 ${
                    active ? 'bg-white/20' : 'bg-[#B85C38]/10 text-[#B85C38]'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load books.{' '}
          <button type="button" className="underline" onClick={() => void refetch()}>
            Retry
          </button>
        </div>
      )}

      {reviewMutation.isError && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not update book. Please try again.
        </div>
      )}

      <AdminCard className="mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[#FDFBF7] text-left text-[#4A5568] border-b border-[#E8E2D9]">
              <tr>
                <th className="px-4 py-3 font-medium min-w-[220px]">Book</th>
                <th className="px-4 py-3 font-medium">Author</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Genre</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Formats</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Submitted</th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-[#4A5568]">
                    Loading books…
                  </td>
                </tr>
              ) : books.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center">
                    <BookOpen size={32} className="mx-auto text-[#E8E2D9]" />
                    <p className="mt-3 text-[#4A5568]">No books match this filter.</p>
                    {statusFilter === 'pending_review' && (
                      <AdminButton
                        variant="secondary"
                        className="mt-3"
                        onClick={() => setStatusFilter('')}
                      >
                        View all books
                      </AdminButton>
                    )}
                  </td>
                </tr>
              ) : (
                books.map((book) => {
                  const price = minBookPrice(book);
                  const isSelected = selectedBookId === book.id;

                  return (
                    <tr
                      key={book.id}
                      onClick={() => openDetail(book)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          openDetail(book);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      className={`border-t border-[#E8E2D9] cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#B85C38]/5'
                          : 'hover:bg-[#FDFBF7]/80'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-14 shrink-0 rounded-md overflow-hidden bg-[#F5F1EB] border border-[#E8E2D9]">
                            {book.cover_image_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={book.cover_image_url}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#4A5568]">
                                <BookOpen size={16} />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-[#1A2A3A] truncate group-hover:text-[#B85C38]">
                              {book.title}
                            </p>
                            {book.subtitle && (
                              <p className="text-xs text-[#4A5568] truncate">{book.subtitle}</p>
                            )}
                            <p className="text-xs text-[#4A5568] md:hidden mt-0.5">
                              {book.genre_name || book.language}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#1A2A3A] max-w-[140px] truncate">
                        {book.author_name}
                      </td>
                      <td className="px-4 py-3 text-[#4A5568] hidden md:table-cell">
                        {book.genre_name || '—'}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <FormatTags book={book} />
                      </td>
                      <td className="px-4 py-3 text-[#1A2A3A] tabular-nums hidden lg:table-cell">
                        {price != null && price > 0 ? `${price.toFixed(0)} ETB` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <AdminBadge tone={bookStatusTone(book.status)}>
                          {formatBookStatus(book.status)}
                        </AdminBadge>
                      </td>
                      <td className="px-4 py-3 text-[#4A5568] whitespace-nowrap hidden sm:table-cell">
                        {new Date(book.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-[#B85C38]">
                        <ChevronRight size={18} aria-hidden />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>

      <p className="mt-3 text-xs text-[#4A5568]">
        Showing {books.length} book{books.length === 1 ? '' : 's'}
        {statusFilter ? ` · ${formatBookStatus(statusFilter)}` : ''}
        {' · '}
        Click a row for details and review actions
      </p>

      {selectedBookId && (() => {
        const fallback = books.find((b) => b.id === selectedBookId);
        const bookForModal = selectedBook ?? fallback;
        if (!bookForModal) return null;
        return (
          <BookReviewModal
            book={bookForModal}
            loading={detailLoading}
            onClose={() => setSelectedBookId(null)}
            onApprove={handleApprove}
            onReject={handleReject}
            isReviewing={reviewMutation.isPending}
          />
        );
      })()}
    </div>
  );
}
