'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { hasPlayableContent } from '@/lib/format-playback';
import { AdminPdfViewer } from './admin-pdf-viewer';
import { AdminAudioPlayer } from './admin-audio-player';
import { FormatMetadataBlock } from './format-metadata-block';
import { approveButtonSmClass, rejectButtonSmClass } from './moderation-button-styles';
import type { BookFormatDetail, ContentReviewStatus } from './types';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
  approved: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200',
  rejected: 'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200',
  changes_requested: 'bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-200',
};

type Props = {
  kind: 'pdf' | 'audio';
  format: BookFormatDetail;
  review: ContentReviewStatus;
  onReview: (status: 'approved' | 'changes_requested' | 'rejected') => void;
  acting: boolean;
  bookTitle?: string;
  bookDescription?: string | null;
  embedViewer?: boolean;
  readerHref?: string;
  bookId?: string;
};

export function FormatReviewPanel({
  kind,
  format,
  review,
  onReview,
  acting,
  bookTitle,
  bookDescription,
  embedViewer = true,
  readerHref,
  bookId,
}: Props) {
  const title = kind === 'pdf' ? 'PDF format' : 'Audio format';
  const status = review?.status || 'pending';

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-muted/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold">{title}</h3>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[status] || STATUS_STYLES.pending}`}
        >
          {status.replace(/_/g, ' ')}
        </span>
      </div>

      {format.missing ? (
        <p className="mt-4 text-sm text-amber-700 dark:text-amber-300">
          Not submitted by author. Reject or request changes if both formats are required.
        </p>
      ) : (
        <FormatMetadataBlock format={format} kind={kind} reviewStatus={status} reviewComment={review?.comment} />
      )}

      {!format.missing && readerHref && !embedViewer && (
        <Link
          href={readerHref}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary/90"
        >
          <ExternalLink size={16} />
          {kind === 'pdf' ? 'Open PDF in reader' : 'Open audio in reader'}
        </Link>
      )}

      {embedViewer && bookId && (
        <div className="mt-4 min-h-[120px] flex-1">
          {kind === 'pdf' && format.fileUrl && (
            <AdminPdfViewer
              bookId={bookId}
              fileUrl={format.fileUrl}
              fileName={format.fileName}
              title={title}
            />
          )}
          {kind === 'pdf' && !format.fileUrl && !format.missing && (
            <p className="text-sm text-muted-foreground">PDF file URL unavailable. Check storage path.</p>
          )}
          {kind === 'audio' && format.fileUrl && (
            <AdminAudioPlayer
              bookId={bookId}
              format={format}
              bookTitle={bookTitle}
              bookDescription={bookDescription}
            />
          )}
          {kind === 'audio' && !format.fileUrl && !format.missing && (
            <p className="text-sm text-muted-foreground">Audio file URL unavailable.</p>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
        <button
          type="button"
          disabled={acting || format.missing || !hasPlayableContent(format)}
          onClick={() => onReview('approved')}
          className={approveButtonSmClass}
        >
          Approve
        </button>
        <button
          type="button"
          disabled={acting || format.missing}
          onClick={() => onReview('rejected')}
          className={rejectButtonSmClass}
        >
          Reject
        </button>
      </div>
    </div>
  );
}
