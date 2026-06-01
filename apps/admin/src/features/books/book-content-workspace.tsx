'use client';

import { useEffect, useRef, useState } from 'react';
import { BookOpen, Headphones } from 'lucide-react';
import { hasPlayableContent } from '@/lib/format-playback';
import { AdminPdfViewer } from './admin-pdf-viewer';
import { AdminAudioPlayer } from './admin-audio-player';
import { FormatMetadataBlock } from './format-metadata-block';
import type {
  BookFormatDetail,
  ContentComparison,
  ContentReviewStatus,
  FormatSlots,
} from './types';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
  approved: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200',
  rejected: 'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200',
  changes_requested: 'bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-200',
};

type FormatReviewActionsProps = {
  kind: 'pdf' | 'audio';
  format: BookFormatDetail;
  review: ContentReviewStatus;
  onReview: (status: 'approved' | 'changes_requested' | 'rejected', comment: string) => void;
  acting: boolean;
};

function FormatReviewActions({
  kind,
  format,
  review,
  onReview,
  acting,
}: FormatReviewActionsProps) {
  const [comment, setComment] = useState(review?.comment || '');

  useEffect(() => {
    setComment(review?.comment || '');
  }, [review?.comment]);

  const status = review?.status || 'pending';

  return (
    <div className="mt-4 space-y-3 border-t border-border pt-4">
      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Review notes for {kind === 'pdf' ? 'PDF' : 'audio'} (optional)
      </label>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder={
          kind === 'pdf'
            ? 'Formatting issues, missing pages, copyright concerns…'
            : 'Audio quality, narration, chapter markers…'
        }
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={acting || format.missing || !hasPlayableContent(format)}
          onClick={() => onReview('approved', comment)}
          className="rounded-lg bg-emerald-400 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-40"
        >
          Approve
        </button>
        <button
          type="button"
          disabled={acting || format.missing}
          onClick={() => onReview('rejected', comment)}
          className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-40 dark:border-red-800 dark:hover:bg-red-950/40"
        >
          Reject
        </button>
      </div>
      <p className="text-[10px] text-muted-foreground">
        Status:{' '}
        <span className={`rounded-full px-2 py-0.5 font-semibold capitalize ${STATUS_STYLES[status] || STATUS_STYLES.pending}`}>
          {status.replace(/_/g, ' ')}
        </span>
      </p>
    </div>
  );
}

function FormatColumn({
  kind,
  format,
  review,
  onReview,
  acting,
  bookId,
  bookTitle,
  bookDescription,
  label,
}: FormatReviewActionsProps & {
  bookId: string;
  bookTitle: string;
  bookDescription?: string | null;
  label?: string;
}) {
  const Icon = kind === 'pdf' ? BookOpen : Headphones;
  const title = label || (kind === 'pdf' ? 'PDF — read content' : 'Audio — listen content');

  return (
    <div className="flex min-h-[480px] flex-col rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Icon size={18} className="text-primary" />
          <h3 className="font-semibold text-foreground">{title}</h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        {format.missing ? (
          <p className="rounded-lg border border-dashed border-amber-300 bg-amber-50/80 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
            No {kind === 'pdf' ? 'PDF' : 'audio'} file submitted. Reject or request changes if both
            formats are required.
          </p>
        ) : (
          <>
            <FormatMetadataBlock
              format={format}
              kind={kind}
              reviewStatus={review?.status}
              reviewComment={review?.comment}
              reviewedAt={review?.reviewedAt}
            />

            <div className="mt-4 min-h-[280px] flex-1 rounded-xl border border-border bg-muted/20 p-2">
              {kind === 'pdf' && hasPlayableContent(format) && (
                <AdminPdfViewer
                  bookId={bookId}
                  fileUrl={format.fileUrl}
                  fallbackUrl={format.playbackUrl}
                  fileName={format.fileName}
                  title={bookTitle}
                />
              )}
              {kind === 'pdf' && !hasPlayableContent(format) && (
                <p className="p-4 text-sm text-muted-foreground">
                  PDF file URL unavailable. Check storage path in metadata above.
                </p>
              )}
              {kind === 'audio' && hasPlayableContent(format) && (
                <AdminAudioPlayer
                  format={format}
                  bookTitle={bookTitle}
                  bookDescription={bookDescription}
                />
              )}
              {kind === 'audio' && !hasPlayableContent(format) && (
                <p className="p-4 text-sm text-muted-foreground">Audio file URL unavailable.</p>
              )}
            </div>

            <FormatReviewActions
              kind={kind}
              format={format}
              review={review}
              onReview={onReview}
              acting={acting}
            />
          </>
        )}
      </div>
    </div>
  );
}

type Props = {
  formatSlots: FormatSlots;
  contentComparison?: ContentComparison | null;
  isUpdate: boolean;
  pdfReview: ContentReviewStatus;
  audioReview: ContentReviewStatus;
  onContentReview: (
    target: 'pdf' | 'audio',
    status: 'approved' | 'changes_requested' | 'rejected',
    comment: string,
  ) => void;
  acting: boolean;
  bookId: string;
  bookTitle: string;
  bookDescription?: string | null;
  focused?: boolean;
};

export function BookContentWorkspace({
  formatSlots,
  contentComparison,
  isUpdate,
  pdfReview,
  audioReview,
  onContentReview,
  acting,
  bookId,
  bookTitle,
  bookDescription,
  focused,
}: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const [compareMode, setCompareMode] = useState(false);

  useEffect(() => {
    if (focused && rootRef.current) {
      rootRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [focused]);

  const pdfFormat = compareMode && isUpdate && contentComparison?.pdf.proposed
    ? contentComparison.pdf.proposed
    : formatSlots.pdf;
  const audioFormat = compareMode && isUpdate && contentComparison?.audio.proposed
    ? contentComparison.audio.proposed
    : formatSlots.audio;

  return (
    <section
      ref={rootRef}
      id="content-workspace"
      className={`scroll-mt-6 rounded-2xl border bg-card shadow-sm ${
        focused ? 'border-primary ring-2 ring-primary/20' : 'border-border'
      }`}
    >
      <div className="border-b border-border px-5 py-4">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-foreground">
          Read & listen content
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Review both formats with full metadata. Read the PDF and listen to the audio using the real
          files authors submitted, then record your per-format decision below.
        </p>
        {isUpdate && contentComparison && (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCompareMode(false)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                !compareMode
                  ? 'bg-primary text-white'
                  : 'border border-border bg-background text-foreground'
              }`}
            >
              Review new submission
            </button>
            <button
              type="button"
              onClick={() => setCompareMode(true)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                compareMode
                  ? 'bg-primary text-white'
                  : 'border border-border bg-background text-foreground'
              }`}
            >
              Compare with live approved
            </button>
          </div>
        )}
      </div>

      {compareMode && isUpdate && contentComparison && (
        <div className="border-b border-border bg-surface/40 px-5 py-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Side-by-side comparison
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-semibold text-foreground">PDF — current live</p>
              {contentComparison.pdf.current?.fileUrl ? (
                <div className="max-h-[360px] overflow-hidden rounded-xl border border-border">
                  <AdminPdfViewer
                    bookId={bookId}
                    fileUrl={contentComparison.pdf.current.fileUrl}
                    fileName={contentComparison.pdf.current.fileName}
                    title="Current PDF"
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No current PDF</p>
              )}
              {contentComparison.pdf.current && (
                <FormatMetadataBlock format={contentComparison.pdf.current} kind="pdf" />
              )}
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-primary">PDF — new submission</p>
              {contentComparison.pdf.proposed?.fileUrl ? (
                <div className="max-h-[360px] overflow-hidden rounded-xl border border-border">
                  <AdminPdfViewer
                    bookId={bookId}
                    fileUrl={contentComparison.pdf.proposed.fileUrl}
                    fileName={contentComparison.pdf.proposed.fileName}
                    title="New PDF"
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No new PDF</p>
              )}
              {contentComparison.pdf.proposed && (
                <FormatMetadataBlock format={contentComparison.pdf.proposed} kind="pdf" />
              )}
            </div>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-semibold text-foreground">Audio — current live</p>
              {contentComparison.audio.current &&
              hasPlayableContent(contentComparison.audio.current) ? (
                <AdminAudioPlayer
                  format={contentComparison.audio.current}
                  label="Current"
                  bookTitle={bookTitle}
                  bookDescription={bookDescription}
                />
              ) : (
                <p className="text-sm text-muted-foreground">No current audio</p>
              )}
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-primary">Audio — new submission</p>
              {contentComparison.audio.proposed &&
              hasPlayableContent(contentComparison.audio.proposed) ? (
                <AdminAudioPlayer
                  format={contentComparison.audio.proposed}
                  label="New submission"
                  bookTitle={bookTitle}
                  bookDescription={bookDescription}
                />
              ) : (
                <p className="text-sm text-muted-foreground">No new audio</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 p-5 lg:grid-cols-2">
        <FormatColumn
          kind="pdf"
          format={pdfFormat}
          review={pdfReview}
          onReview={(s, c) => onContentReview('pdf', s, c)}
          acting={acting}
          bookId={bookId}
          bookTitle={bookTitle}
          bookDescription={bookDescription}
          label={compareMode ? 'PDF — new submission (review)' : undefined}
        />
        <FormatColumn
          kind="audio"
          format={audioFormat}
          review={audioReview}
          onReview={(s, c) => onContentReview('audio', s, c)}
          acting={acting}
          bookId={bookId}
          bookTitle={bookTitle}
          bookDescription={bookDescription}
          label={compareMode ? 'Audio — new submission (review)' : undefined}
        />
      </div>
    </section>
  );
}
