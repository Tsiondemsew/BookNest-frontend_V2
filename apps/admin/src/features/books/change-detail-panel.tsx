'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AdminAudioPlayer } from '@/features/books/admin-audio-player';
import { AdminPdfViewer } from '@/features/books/admin-pdf-viewer';
import { ChangeItemModerationBar } from '@/features/books/change-item-moderation-bar';
import {
  getBookChangeReviewProgress,
  hasContentInComparison,
  resolveContentComparison,
} from '@/features/books/change-review-progress';
import { approveButtonClass, rejectButtonClass } from '@/features/books/moderation-button-styles';
import { getChangeItemStatus } from '@/features/books/use-change-item-moderation';
import { hasPlayableContent } from '@/lib/format-playback';
import type {
  BookFormatDetail,
  BookSnapshot,
  ChangeDecisionStatus,
  ContentComparison,
  FieldChange,
  PendingBook,
} from './types';

const PRICE_FIELDS = new Set(['pdf_price', 'audio_price', 'bundle_price', 'currency']);

const SNAPSHOT_FIELDS: { key: keyof BookSnapshot | string; label: string }[] = [
  { key: 'title', label: 'Title' },
  { key: 'subtitle', label: 'Subtitle' },
  { key: 'description', label: 'Description' },
  { key: 'isbn', label: 'ISBN' },
  { key: 'author_name', label: 'Author name' },
  { key: 'publisher_name', label: 'Publisher' },
  { key: 'language', label: 'Language' },
  { key: 'genre_name', label: 'Category' },
  { key: 'cover_image_url', label: 'Cover image' },
  { key: 'publication_date', label: 'Publication date' },
  { key: 'pdf_price', label: 'PDF price' },
  { key: 'audio_price', label: 'Audio price' },
  { key: 'bundle_price', label: 'Bundle price' },
  { key: 'currency', label: 'Currency' },
];

function computeClientChanges(
  previous: BookSnapshot | null | undefined,
  proposed: BookSnapshot | null | undefined,
): FieldChange[] {
  if (!previous || !proposed) return [];
  const changes: FieldChange[] = [];
  for (const { key, label } of SNAPSHOT_FIELDS) {
    const prevVal = (previous as Record<string, unknown>)[key];
    const nextVal = (proposed as Record<string, unknown>)[key];
    const prevStr = prevVal == null ? '' : String(prevVal).trim();
    const nextStr = nextVal == null ? '' : String(nextVal).trim();
    if (prevStr !== nextStr) {
      changes.push({
        field: key,
        label,
        previous: prevStr || null,
        proposed: nextStr || null,
      });
    }
  }
  return changes;
}

function truncate(text: string, max: number) {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}

function formatMoney(value: string | null, currency?: string | null) {
  if (!value) return '—';
  const num = Number(value);
  if (!Number.isFinite(num)) return value;
  return `${currency || 'ETB'} ${num.toFixed(2)}`;
}

function formatBytes(n: number | null | undefined) {
  if (n == null) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(sec: number | null | undefined) {
  if (sec == null || !Number.isFinite(sec)) return '—';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function ChangeValue({
  value,
  variant,
  field,
  expanded,
  onToggle,
  currency,
}: {
  value: string | null;
  variant: 'previous' | 'proposed';
  field: string;
  expanded: boolean;
  onToggle: () => void;
  currency?: string | null;
}) {
  const isPrice = PRICE_FIELDS.has(field);
  const isLong = field === 'description' && (value?.length ?? 0) > 280;
  const display = isPrice
    ? formatMoney(value, field === 'currency' ? null : currency)
    : isLong && !expanded && value
      ? truncate(value, 280)
      : value || '—';

  const tone =
    variant === 'previous'
      ? 'text-slate-500 line-through decoration-slate-400'
      : 'font-medium text-slate-900 dark:text-slate-100';

  return (
    <div>
      <p className={`whitespace-pre-wrap text-sm ${tone}`}>{display}</p>
      {isLong && (
        <button
          type="button"
          onClick={onToggle}
          className="mt-1 text-xs font-medium text-accent hover:underline dark:text-indigo-400"
        >
          {expanded ? 'Show less' : 'Show full text'}
        </button>
      )}
    </div>
  );
}

type ItemModerationProps = {
  status?: ChangeDecisionStatus;
  approving?: boolean;
  rejecting?: boolean;
  disabled?: boolean;
  approveLabel?: string;
  rejectLabel?: string;
  onApprove?: () => void | Promise<void>;
  onReject?: () => void | Promise<void>;
};

/** Approve / reject buttons shown below every change block */
function ChangeItemActions({
  changeId,
  moderation,
}: {
  changeId: string;
  moderation?: ItemModerationProps;
}) {
  if (!moderation?.onApprove && !moderation?.onReject) return null;

  return (
    <ChangeItemModerationBar
      changeId={changeId}
      status={moderation.status ?? 'pending'}
      approving={moderation.approving}
      rejecting={moderation.rejecting}
      disabled={moderation.disabled}
      approveLabel={moderation.approveLabel ?? 'Approve change'}
      rejectLabel={moderation.rejectLabel ?? 'Reject change'}
      onApprove={moderation.onApprove}
      onReject={moderation.onReject}
    />
  );
}

function CompareColumn({
  title,
  variant,
  children,
}: {
  title: string;
  variant: 'previous' | 'proposed';
  children: ReactNode;
}) {
  const titleClass =
    variant === 'previous' ? 'text-slate-500' : 'text-indigo-600 dark:text-indigo-400';
  const boxClass =
    variant === 'previous'
      ? 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50'
      : 'border-indigo-300 bg-indigo-50/80 dark:border-indigo-800 dark:bg-indigo-950/40';

  return (
    <div className={`rounded-lg border-2 p-3 ${boxClass}`}>
      <p className={`mb-2 text-[11px] font-bold uppercase tracking-wide ${titleClass}`}>{title}</p>
      {children}
    </div>
  );
}

function CoverCompare({
  previousUrl,
  proposedUrl,
  moderation,
}: {
  previousUrl: string | null;
  proposedUrl: string | null;
  moderation?: ItemModerationProps;
}) {
  return (
    <div className={`rounded-xl border p-4 ${changeBlockClass(moderation?.status)}`}>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <CompareColumn title="Previous cover" variant="previous">
        {previousUrl ? (
          <img
            src={previousUrl}
            alt=""
            className="mx-auto aspect-[2/3] max-w-[140px] rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
          />
        ) : (
          <p className="text-sm text-slate-400">None</p>
        )}
      </CompareColumn>
      <CompareColumn title="Edited cover" variant="proposed">
        {proposedUrl ? (
          <img
            src={proposedUrl}
            alt=""
            className="mx-auto aspect-[2/3] max-w-[140px] rounded-lg object-cover ring-2 ring-indigo-400"
          />
        ) : (
          <p className="text-sm text-slate-400">None</p>
        )}
      </CompareColumn>
    </div>
    <ChangeItemActions changeId="cover_image_url" moderation={moderation} />
    </div>
  );
}

function ContentDetailRows({ format, kind }: { format: BookFormatDetail | null; kind: 'pdf' | 'audio' }) {
  if (!format) {
    return <p className="text-sm text-slate-400 italic">Not on file</p>;
  }
  return (
    <dl className="space-y-2 text-sm">
      <div>
        <dt className="text-[10px] font-semibold uppercase text-slate-400">File</dt>
        <dd className="font-medium break-all text-foreground">{format.fileName || '—'}</dd>
      </div>
      <div>
        <dt className="text-[10px] font-semibold uppercase text-slate-400">Price</dt>
        <dd className="font-medium text-foreground">
          {format.price != null ? `${format.currency} ${format.price}` : '—'}
        </dd>
      </div>
      <div>
        <dt className="text-[10px] font-semibold uppercase text-slate-400">Size</dt>
        <dd className="font-medium text-foreground">{formatBytes(format.fileSizeBytes)}</dd>
      </div>
      {kind === 'pdf' ? (
        <div>
          <dt className="text-[10px] font-semibold uppercase text-slate-400">Pages</dt>
          <dd className="font-medium text-foreground">{format.pageCount ?? '—'}</dd>
        </div>
      ) : (
        <div>
          <dt className="text-[10px] font-semibold uppercase text-slate-400">Duration</dt>
          <dd className="font-medium text-foreground">{formatDuration(format.durationSec)}</dd>
        </div>
      )}
    </dl>
  );
}

function ContentFormatBlock({
  bookId,
  bookTitle,
  format,
  kind,
  variant = 'proposed',
}: {
  bookId: string;
  bookTitle?: string;
  format: BookFormatDetail | null;
  kind: 'pdf' | 'audio';
  /** Previous column uses the format's own URL; edited column prefers live book content */
  variant?: 'previous' | 'proposed';
}) {
  if (!format) {
    return <p className="text-sm text-slate-400 italic">Not on file</p>;
  }

  const readerHref = `/dashboard/books/${bookId}/reader?format=${kind}`;

  return (
    <div className="space-y-3">
      <ContentDetailRows format={format} kind={kind} />
      {hasPlayableContent(format) && (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-900/80">
          {kind === 'pdf' && (
            <div className="max-h-[min(360px,50vh)] overflow-y-auto">
              <AdminPdfViewer
                embedded
                bookId={bookId}
                fileUrl={format.fileUrl}
                fallbackUrl={format.playbackUrl}
                fileName={format.fileName}
                title={format.fileName || 'PDF preview'}
                preferDirectSource={variant === 'previous'}
                contentKey={`${variant}-${format.id ?? format.fileUrl ?? format.storagePath ?? 'pdf'}`}
              />
            </div>
          )}
          {kind === 'audio' && (
            <div className="p-2">
              <AdminAudioPlayer
                compact
                bookId={bookId}
                format={format}
                bookTitle={bookTitle}
                preferDirectSource={variant === 'previous'}
              />
            </div>
          )}
        </div>
      )}
      {hasPlayableContent(format) && (
        <Link
          href={readerHref}
          className="inline-block text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Open full reader →
        </Link>
      )}
    </div>
  );
}

function ContentCompareSection({
  bookId,
  bookTitle,
  comparison,
  forceShow = false,
  itemModeration,
}: {
  bookId: string;
  bookTitle?: string;
  comparison: ContentComparison;
  forceShow?: boolean;
  itemModeration?: (changeId: 'content_pdf' | 'content_audio') => ItemModerationProps | undefined;
}) {
  const hasPdf = comparison.pdf.current || comparison.pdf.proposed;
  const hasAudio = comparison.audio.current || comparison.audio.proposed;
  if (!hasPdf && !hasAudio) return null;

  return (
    <div className="space-y-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400">
        Content (PDF & audio)
      </p>
      {(forceShow || hasPdf) && (
        <div className={`rounded-xl border p-4 ${changeBlockClass(itemModeration?.('content_pdf')?.status)}`}>
          <p className="mb-3 text-sm font-bold text-foreground">PDF</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 [&>div]:min-w-0">
            <CompareColumn title="Previous" variant="previous">
              <ContentFormatBlock
                bookId={bookId}
                bookTitle={bookTitle}
                format={comparison.pdf.current}
                kind="pdf"
              />
            </CompareColumn>
            <CompareColumn title="Edited" variant="proposed">
              <ContentFormatBlock
                bookId={bookId}
                bookTitle={bookTitle}
                format={comparison.pdf.proposed}
                kind="pdf"
              />
            </CompareColumn>
          </div>
          <ChangeItemActions changeId="content_pdf" moderation={itemModeration?.('content_pdf') ?? undefined} />
        </div>
      )}
      {(forceShow || hasAudio) && (
        <div className={`rounded-xl border p-4 ${changeBlockClass(itemModeration?.('content_audio')?.status)}`}>
          <p className="mb-3 text-sm font-bold text-foreground">Audio</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 [&>div]:min-w-0">
            <CompareColumn title="Previous" variant="previous">
              <ContentFormatBlock
                bookId={bookId}
                bookTitle={bookTitle}
                format={comparison.audio.current}
                kind="audio"
                variant="previous"
              />
            </CompareColumn>
            <CompareColumn title="Edited" variant="proposed">
              <ContentFormatBlock
                bookId={bookId}
                bookTitle={bookTitle}
                format={comparison.audio.proposed}
                kind="audio"
                variant="proposed"
              />
            </CompareColumn>
          </div>
          <ChangeItemActions changeId="content_audio" moderation={itemModeration?.('content_audio') ?? undefined} />
        </div>
      )}
    </div>
  );
}
function changeBlockClass(status?: ChangeDecisionStatus) {
  if (status === 'approved') {
    return 'border-emerald-300 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/30';
  }
  if (status === 'rejected') {
    return 'border-red-300 bg-red-50/50 dark:border-red-800 dark:bg-red-950/30';
  }
  return 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/60';
}

function ChangeRow({
  change,
  currency,
  moderation,
}: {
  change: FieldChange;
  currency?: string | null;
  moderation?: ItemModerationProps;
}) {
  const [expanded, setExpanded] = useState(false);
  if (change.field === 'cover_image_url') return null;

  const status = moderation?.status ?? 'pending';

  return (
    <div className={`rounded-xl border p-4 ${changeBlockClass(status)}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400">
          {change.label}
        </p>
        {status === 'approved' && (
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Approved</span>
        )}
        {status === 'rejected' && (
          <span className="text-xs font-bold text-red-700 dark:text-red-300">Rejected</span>
        )}
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <CompareColumn title="Previous" variant="previous">
          <ChangeValue
            value={change.previous}
            variant="previous"
            field={change.field}
            expanded={expanded}
            onToggle={() => setExpanded((e) => !e)}
            currency={currency}
          />
        </CompareColumn>
        <CompareColumn title="Edited" variant="proposed">
          <ChangeValue
            value={change.proposed}
            variant="proposed"
            field={change.field}
            expanded={expanded}
            onToggle={() => setExpanded((e) => !e)}
            currency={currency}
          />
        </CompareColumn>
      </div>
      <ChangeItemActions changeId={change.field} moderation={moderation} />
    </div>
  );
}

export type ChangeDetailModerationActions = {
  acting?: boolean;
  canApprove?: boolean;
  canReject?: boolean;
  canRequestChanges?: boolean;
  canModerateItems?: boolean;
  approveLabel?: string;
  onApprove?: () => void;
  onReject?: () => void;
  onRequestChanges?: () => void;
  actingItemId?: string | null;
  actingAction?: 'approve' | 'reject' | null;
  onItemApprove?: (changeId: string) => void | Promise<void>;
  onItemReject?: (changeId: string) => void | Promise<void>;
  itemApproveLabel?: string;
  itemRejectLabel?: string;
};

export function ChangeDetailPanel({
  book,
  compact = false,
  highlighted = false,
  expanded = false,
  showFullComparison = false,
  moderationActions,
}: {
  book: PendingBook;
  compact?: boolean;
  highlighted?: boolean;
  expanded?: boolean;
  showFullComparison?: boolean;
  moderationActions?: ChangeDetailModerationActions;
}) {
  const sectionRef = useRef<HTMLElement>(null);

  const isUpdate =
    book.submissionType === 'metadata_update' ||
    book.type === 'UPDATE' ||
    Boolean(book.previous && book.proposed);

  const effectiveChanges = useMemo(() => {
    const fromApi = book.changes ?? [];
    if (fromApi.length > 0) return fromApi;
    if (showFullComparison || isUpdate) {
      return computeClientChanges(book.previous, book.proposed);
    }
    return [];
  }, [book.changes, book.previous, book.proposed, showFullComparison, isUpdate]);

  const currency =
    book.proposed?.currency ??
    book.previous?.currency ??
    book.pricing?.currency ??
    'ETB';

  const prevCover = book.previous?.cover_image_url ?? null;
  const nextCover = book.proposed?.cover_image_url ?? book.coverImageUrl ?? null;
  const coverChanged =
    effectiveChanges.some((c) => c.field === 'cover_image_url') ||
    ((prevCover || nextCover) &&
      (showFullComparison || isUpdate || prevCover !== nextCover));

  const priceChanges = effectiveChanges.filter((c) => PRICE_FIELDS.has(c.field));
  const metadataChanges = effectiveChanges.filter(
    (c) => !PRICE_FIELDS.has(c.field) && c.field !== 'cover_image_url',
  );

  const contentComparison = useMemo(() => resolveContentComparison(book), [book]);

  const showContent =
    hasContentInComparison(contentComparison) && (showFullComparison || isUpdate);

  const hasContentToShow = showContent && Boolean(contentComparison);

  const hasAnyChanges =
    metadataChanges.length > 0 ||
    priceChanges.length > 0 ||
    coverChanged ||
    hasContentToShow;

  const reviewProgress = useMemo(
    () => getBookChangeReviewProgress(book, showFullComparison),
    [book, showFullComparison],
  );

  const hasItemHandlers = Boolean(
    moderationActions?.onItemApprove || moderationActions?.onItemReject,
  );

  const itemModeration = (changeId: string): ItemModerationProps | undefined => {
    if (!hasItemHandlers || !moderationActions) return undefined;

    const isThisItem = moderationActions.actingItemId === changeId;
    const approving = isThisItem && moderationActions.actingAction === 'approve';
    const rejecting = isThisItem && moderationActions.actingAction === 'reject';
    const disabled =
      moderationActions.canModerateItems !== undefined &&
      moderationActions.canModerateItems === false;
    const status = getChangeItemStatus(book.reviewState, changeId);

    return {
      status,
      approving,
      rejecting,
      disabled,
      approveLabel: moderationActions.itemApproveLabel ?? 'Approve change',
      rejectLabel: moderationActions.itemRejectLabel ?? 'Reject change',
      onApprove: moderationActions.onItemApprove
        ? () => void moderationActions.onItemApprove!(changeId)
        : undefined,
      onReject: moderationActions.onItemReject
        ? () => void moderationActions.onItemReject!(changeId)
        : undefined,
    };
  };

  const contentSection =
    hasContentToShow && contentComparison ? (
      <ContentCompareSection
        bookId={book.id}
        bookTitle={book.title}
        comparison={contentComparison}
        forceShow={showFullComparison || isUpdate}
        itemModeration={hasItemHandlers ? (id) => itemModeration(id) ?? undefined : undefined}
      />
    ) : null;

  useEffect(() => {
    if (highlighted && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [highlighted]);

  const shellClass = expanded
    ? 'p-4 sm:p-5'
    : compact
      ? 'max-h-[min(70vh,560px)] overflow-y-auto p-4'
      : 'p-6 shadow-sm';

  return (
    <section
      ref={sectionRef}
      id="changes"
      className={`rounded-2xl border bg-card transition-shadow dark:bg-slate-900 ${
        highlighted
          ? 'border-indigo-400 ring-2 ring-indigo-500/40 shadow-lg'
          : 'border-slate-200 dark:border-slate-700'
      } ${shellClass}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className={`font-bold text-slate-900 dark:text-slate-100 ${compact && !expanded ? 'text-sm' : 'text-base sm:text-lg'}`}>
          Change details
        </h2>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
            reviewProgress.allApproved
              ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-200'
              : isUpdate
                ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-200'
                : 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-200'
          }`}
        >
          {reviewProgress.allApproved
            ? 'All changes approved'
            : isUpdate
              ? `Update submission (${reviewProgress.approved}/${reviewProgress.total} approved)`
              : 'New entry'}
        </span>
      </div>

      {reviewProgress.total > 0 && (
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/40">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
            <span>
              {reviewProgress.approved} approved · {reviewProgress.rejected} rejected ·{' '}
              {reviewProgress.pending} pending
            </span>
            {reviewProgress.allApproved && (
              <span className="font-bold text-emerald-700 dark:text-emerald-300">
                Ready to approve update
              </span>
            )}
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{
                width: `${reviewProgress.total ? (reviewProgress.approved / reviewProgress.total) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        <span className="font-semibold text-slate-500">Previous</span> = last approved version ·{' '}
        <span className="font-semibold text-indigo-600 dark:text-indigo-400">Edited</span> = author&apos;s new submission
      </p>

      {moderationActions &&
        (moderationActions.canApprove || moderationActions.canReject) && (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
            {moderationActions.canApprove && moderationActions.onApprove && (
              <button
                type="button"
                disabled={Boolean(moderationActions.acting)}
                onClick={(e) => {
                  e.preventDefault();
                  moderationActions.onApprove?.();
                }}
                className={`inline-flex min-h-[44px] touch-manipulation cursor-pointer items-center active:scale-[0.98] ${approveButtonClass}`}
              >
                {moderationActions.approveLabel ?? 'Approve'}
              </button>
            )}
            {moderationActions.canReject && moderationActions.onReject && (
              <button
                type="button"
                disabled={Boolean(moderationActions.acting)}
                onClick={(e) => {
                  e.preventDefault();
                  moderationActions.onReject?.();
                }}
                className={`inline-flex min-h-[44px] touch-manipulation cursor-pointer items-center active:scale-[0.98] ${rejectButtonClass}`}
              >
                Reject
              </button>
            )}
          </div>
        )}

      {book.updateNote && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/40">
          <p className="text-xs font-bold uppercase text-amber-800 dark:text-amber-300">
            Author update note
          </p>
          <p className="mt-1 text-sm text-amber-950 dark:text-amber-100">{book.updateNote}</p>
        </div>
      )}

      {!hasAnyChanges ? (
        <div className="mt-4 space-y-4">
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-slate-600 dark:bg-slate-800/30">
            <p className="font-medium text-slate-800 dark:text-slate-200">First-time submission</p>
            <p className="mt-1 text-sm text-slate-500">
              No previous version to compare — use the actions below to approve or reject.
            </p>
          </div>
          <ChangeItemActions changeId="submission" moderation={itemModeration('submission')} />
          {contentSection}
        </div>
      ) : (
        <div className="mt-5 space-y-6">
          {coverChanged && (prevCover || nextCover) && (
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-600">Cover</p>
              <CoverCompare
                previousUrl={prevCover}
                proposedUrl={nextCover}
                moderation={itemModeration('cover_image_url')}
              />
            </div>
          )}

          {metadataChanges.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Metadata ({metadataChanges.length} changed)
              </p>
              {metadataChanges.map((change) => (
                <ChangeRow
                  key={change.field}
                  change={change}
                  currency={currency}
                  moderation={itemModeration(change.field)}
                />
              ))}
            </div>
          )}

          {priceChanges.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Pricing ({priceChanges.length} changed)
              </p>
              {priceChanges.map((change) => (
                <ChangeRow
                  key={change.field}
                  change={change}
                  currency={currency}
                  moderation={itemModeration(change.field)}
                />
              ))}
            </div>
          )}

          {contentSection}
        </div>
      )}
    </section>
  );
}
