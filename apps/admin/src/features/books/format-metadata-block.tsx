'use client';

import type { BookFormatDetail } from './types';

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(
      new Date(iso),
    );
  } catch {
    return iso;
  }
}

function formatBytes(n: number | null | undefined) {
  if (n == null) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(sec: number | null | undefined) {
  if (sec == null || !Number.isFinite(sec)) return '—';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

type Props = {
  format: BookFormatDetail;
  kind: 'pdf' | 'audio';
  reviewStatus?: string;
  reviewComment?: string | null;
  reviewedAt?: string | null;
};

function sourceBadge(format: BookFormatDetail) {
  if (format.isDemoContent) {
    return (
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-200">
        Demo
      </span>
    );
  }
  if (format.fileUrl || format.playbackUrl) {
    return (
      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
        Uploaded
      </span>
    );
  }
  return null;
}

export function FormatMetadataBlock({
  format,
  kind,
  reviewStatus,
  reviewComment,
  reviewedAt,
}: Props) {
  const status = reviewStatus || 'pending';

  return (
    <dl className="grid gap-2 rounded-xl border border-border/80 bg-background/60 p-3 text-xs sm:grid-cols-2">
      <div className="sm:col-span-2 flex flex-wrap items-center gap-2">
        {sourceBadge(format)}
        {format.demoLabel && (
          <span className="text-xs text-muted-foreground">{format.demoLabel}</span>
        )}
      </div>
      <div>
        <dt className="text-muted-foreground">Format</dt>
        <dd className="font-semibold text-foreground">{kind === 'pdf' ? 'PDF (read)' : 'Audio (listen)'}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Review status</dt>
        <dd className="font-semibold capitalize text-foreground">{status.replace(/_/g, ' ')}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Price</dt>
        <dd className="font-medium">
          {format.price != null ? `${format.currency} ${format.price}` : '—'}
        </dd>
      </div>
      <div>
        <dt className="text-muted-foreground">File name</dt>
        <dd className="truncate font-medium" title={format.fileName || undefined}>
          {format.fileName || '—'}
        </dd>
      </div>
      <div>
        <dt className="text-muted-foreground">File size</dt>
        <dd className="font-medium">{formatBytes(format.fileSizeBytes)}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">MIME type</dt>
        <dd className="font-medium">{format.mimeType || (kind === 'pdf' ? 'application/pdf' : 'audio/*')}</dd>
      </div>
      {kind === 'pdf' ? (
        <div>
          <dt className="text-muted-foreground">Pages</dt>
          <dd className="font-medium">{format.pageCount ?? '—'}</dd>
        </div>
      ) : (
        <div>
          <dt className="text-muted-foreground">Duration</dt>
          <dd className="font-medium">{formatDuration(format.durationSec)}</dd>
        </div>
      )}
      <div>
        <dt className="text-muted-foreground">Uploaded</dt>
        <dd className="font-medium">{formatDate(format.uploadedAt)}</dd>
      </div>
      {reviewComment && (
        <div className="sm:col-span-2">
          <dt className="text-muted-foreground">Last review note</dt>
          <dd className="whitespace-pre-wrap text-sm text-foreground">{reviewComment}</dd>
        </div>
      )}
      {reviewedAt && (
        <div>
          <dt className="text-muted-foreground">Reviewed at</dt>
          <dd className="font-medium">{formatDate(reviewedAt)}</dd>
        </div>
      )}
    </dl>
  );
}
