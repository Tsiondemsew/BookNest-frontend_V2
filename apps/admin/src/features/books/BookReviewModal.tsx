'use client';

import { useState } from 'react';
import {
  X,
  BookOpen,
  Headphones,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Loader2,
  FileText,
} from 'lucide-react';
import type { AdminBookRow } from '@repo/api-client';
import { mainAppUrl } from '@/lib/mainAppUrl';
import { AdminBadge, AdminButton } from '@/components/ui/AdminUi';
import { bookStatusTone, formatBookStatus, minBookPrice } from './bookUtils';

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (value == null || value === '') return null;
  return (
    <div className="grid grid-cols-[120px_1fr] gap-2 text-sm py-1.5 border-b border-[#E8E2D9]/60 last:border-0">
      <dt className="text-[#4A5568]">{label}</dt>
      <dd className="text-[#1A2A3A] font-medium break-words">{value}</dd>
    </div>
  );
}

type BookReviewModalProps = {
  book: AdminBookRow;
  loading?: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  isReviewing: boolean;
};

export function BookReviewModal({
  book,
  loading,
  onClose,
  onApprove,
  onReject,
  isReviewing,
}: BookReviewModalProps) {
  const [confirmReject, setConfirmReject] = useState(false);
  const [previewFormatId, setPreviewFormatId] = useState<string | null>(null);
  const minPrice = minBookPrice(book);
  const canReview = book.status === 'pending_review';
  const previewFormat = book.formats.find((f) => f.id === previewFormatId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-[#1A2A3A]/50 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-[#E8E2D9] bg-white shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E2D9] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <AdminBadge tone={bookStatusTone(book.status)}>
              {formatBookStatus(book.status)}
            </AdminBadge>
            <h2 className="text-lg font-semibold text-[#1A2A3A] truncate">{book.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#4A5568] hover:bg-[#FDFBF7] shrink-0"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#4A5568]">
            <Loader2 className="animate-spin mr-2" size={20} />
            Loading book details…
          </div>
        ) : (
          <div className="p-5 grid md:grid-cols-2 gap-6 min-h-0 overflow-hidden">
            <div className="min-w-0 space-y-4">
              <div className="flex gap-4">
                <div className="w-24 shrink-0 aspect-[2/3] rounded-lg overflow-hidden bg-[#F5F1EB] border border-[#E8E2D9]">
                  {book.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={book.cover_image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="text-[#4A5568]" size={28} />
                    </div>
                  )}
                </div>
                <div className="min-w-0 text-sm">
                  <p className="font-semibold text-[#1A2A3A]">{book.author_name}</p>
                  {book.subtitle && <p className="text-[#4A5568] mt-0.5">{book.subtitle}</p>}
                </div>
              </div>

              <dl className="rounded-xl border border-[#E8E2D9] bg-[#FDFBF7] px-3 py-1">
                <MetaRow label="Genre" value={book.genre_name} />
                <MetaRow label="Language" value={book.language} />
                <MetaRow label="ISBN" value={book.isbn} />
                <MetaRow label="Publisher" value={book.publisher_name} />
                <MetaRow
                  label="Published"
                  value={
                    book.publication_date
                      ? new Date(book.publication_date).toLocaleDateString()
                      : null
                  }
                />
                <MetaRow label="Uploader" value={book.uploader_email} />
                <MetaRow label="Role" value={book.uploaded_by_role} />
                <MetaRow
                  label="Submitted"
                  value={new Date(book.created_at).toLocaleString()}
                />
                <MetaRow
                  label="Reviewed"
                  value={
                    book.reviewed_at ? new Date(book.reviewed_at).toLocaleString() : null
                  }
                />
                {minPrice != null && minPrice > 0 && (
                  <MetaRow label="From" value={`${minPrice.toFixed(0)} ETB`} />
                )}
              </dl>

              {book.description && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-[#4A5568] mb-1">
                    Description
                  </h4>
                  <p className="text-sm text-[#1A2A3A] line-clamp-4">{book.description}</p>
                </div>
              )}
            </div>

            <div className="min-w-0 flex flex-col gap-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-[#4A5568]">
                Files & preview
              </h4>
              {book.formats.length === 0 ? (
                <p className="text-sm text-[#4A5568]">No formats uploaded.</p>
              ) : (
                <div className="space-y-2">
                  {book.formats.map((format) => (
                    <div
                      key={format.id}
                      className="rounded-xl border border-[#E8E2D9] bg-[#FDFBF7] p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {format.format_type === 'Audio' ? (
                            <Headphones size={16} className="text-[#B85C38]" />
                          ) : (
                            <BookOpen size={16} className="text-[#B85C38]" />
                          )}
                          <span className="font-medium text-sm text-[#1A2A3A]">
                            {format.format_type}
                          </span>
                          <span className="text-sm tabular-nums text-[#2C3E50]">
                            {Number(format.price).toFixed(0)} ETB
                          </span>
                        </div>
                        {format.preview_url ? (
                          <AdminButton
                            variant="secondary"
                            className="text-xs py-1.5 px-2.5"
                            type="button"
                            onClick={() =>
                              setPreviewFormatId(
                                previewFormatId === format.id ? null : format.id
                              )
                            }
                          >
                            <FileText size={14} className="mr-1" />
                            {previewFormatId === format.id ? 'Hide' : 'Preview'}
                          </AdminButton>
                        ) : (
                          <span className="text-xs text-[#4A5568]">No file</span>
                        )}
                      </div>
                      {format.preview_url && (
                        <a
                          href={format.preview_url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-xs text-[#B85C38] hover:underline"
                        >
                          Open in new tab
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {previewFormat?.preview_url && previewFormat.format_type === 'PDF' && (
                <iframe
                  title="PDF preview"
                  src={previewFormat.preview_url}
                  className="w-full h-48 rounded-xl border border-[#E8E2D9] bg-[#F5F1EB]"
                />
              )}
              {previewFormat?.preview_url && previewFormat.format_type === 'Audio' && (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <audio controls src={previewFormat.preview_url} className="w-full" />
              )}

              {book.status === 'approved' && (
                <a
                  href={`${mainAppUrl}/market/${book.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-[#B85C38] hover:underline mt-auto"
                >
                  View listing on main site
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        )}

        <div className="px-5 py-4 border-t border-[#E8E2D9] bg-[#FDFBF7] shrink-0 space-y-3">
          {canReview && !confirmReject && (
            <div className="flex gap-3">
              <AdminButton className="flex-1 gap-2" disabled={isReviewing || loading} onClick={onApprove}>
                {isReviewing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                Approve
              </AdminButton>
              <AdminButton
                variant="danger"
                className="flex-1 gap-2"
                disabled={isReviewing || loading}
                onClick={() => setConfirmReject(true)}
              >
                <XCircle size={16} />
                Reject
              </AdminButton>
            </div>
          )}
          {canReview && confirmReject && (
            <div className="flex gap-2">
              <AdminButton variant="secondary" className="flex-1" disabled={isReviewing} onClick={() => setConfirmReject(false)}>
                Cancel
              </AdminButton>
              <AdminButton variant="danger" className="flex-1" disabled={isReviewing} onClick={onReject}>
                {isReviewing ? 'Rejecting…' : 'Confirm reject'}
              </AdminButton>
            </div>
          )}
          {!canReview && !loading && (
            <p className="text-sm text-center text-[#4A5568]">
              This book is {formatBookStatus(book.status)}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
