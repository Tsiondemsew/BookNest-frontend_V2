import type {
  BookSnapshot,
  ContentComparison,
  FieldChange,
  PendingBook,
  ReviewState,
} from './types';
import { getChangeItemStatus } from './use-change-item-moderation';

export function resolveContentComparison(book: PendingBook): ContentComparison | null {
  if (book.contentComparison) return book.contentComparison;

  if (book.formatSlots) {
    return {
      pdf: {
        current: null,
        proposed: book.formatSlots.pdf.missing ? null : book.formatSlots.pdf,
      },
      audio: {
        current: null,
        proposed: book.formatSlots.audio.missing ? null : book.formatSlots.audio,
      },
    };
  }

  if (book.formats?.length) {
    const pdf = book.formats.find((f) => f.formatType === 'PDF') ?? null;
    const audio = book.formats.find((f) => f.formatType === 'Audio') ?? null;
    return {
      pdf: { current: null, proposed: pdf },
      audio: { current: null, proposed: audio },
    };
  }

  return null;
}

export function hasContentInComparison(
  comparison: ContentComparison | null | undefined,
): boolean {
  if (!comparison) return false;
  return Boolean(
    comparison.pdf.current ||
      comparison.pdf.proposed ||
      comparison.audio.current ||
      comparison.audio.proposed,
  );
}

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

export function getEffectiveChanges(
  book: PendingBook,
  showFullComparison = false,
): FieldChange[] {
  const isUpdate =
    book.submissionType === 'metadata_update' ||
    book.type === 'UPDATE' ||
    Boolean(book.previous && book.proposed);
  const fromApi = book.changes ?? [];
  if (fromApi.length > 0) return fromApi;
  if (showFullComparison || isUpdate) {
    return computeClientChanges(book.previous, book.proposed);
  }
  return [];
}

export function collectChangeIds(book: PendingBook, showFullComparison = false): string[] {
  const isUpdate =
    book.submissionType === 'metadata_update' ||
    book.type === 'UPDATE' ||
    Boolean(book.previous && book.proposed);

  const effectiveChanges = getEffectiveChanges(book, showFullComparison);
  const ids = new Set<string>();

  for (const change of effectiveChanges) {
    if (change.field !== 'cover_image_url') {
      ids.add(change.field);
    }
  }

  const prevCover = book.previous?.cover_image_url ?? null;
  const nextCover = book.proposed?.cover_image_url ?? book.coverImageUrl ?? null;
  const coverChanged =
    effectiveChanges.some((c) => c.field === 'cover_image_url') ||
    ((prevCover || nextCover) &&
      (showFullComparison || isUpdate || prevCover !== nextCover));
  if (coverChanged && (prevCover || nextCover)) {
    ids.add('cover_image_url');
  }

  const contentComparison = resolveContentComparison(book);
  const showContent =
    hasContentInComparison(contentComparison) && (showFullComparison || isUpdate);
  if (showContent && contentComparison) {
    const { pdf, audio } = contentComparison;
    if (pdf.current || pdf.proposed) ids.add('content_pdf');
    if (audio.current || audio.proposed) ids.add('content_audio');
  }

  if (ids.size === 0 && !isUpdate) {
    ids.add('submission');
  }

  return [...ids];
}

export interface ChangeReviewProgress {
  total: number;
  approved: number;
  rejected: number;
  pending: number;
  allApproved: boolean;
  allReviewed: boolean;
  changeIds: string[];
}

export function getBookChangeReviewProgress(
  book: PendingBook,
  showFullComparison = false,
): ChangeReviewProgress {
  const changeIds = collectChangeIds(book, showFullComparison);
  let approved = 0;
  let rejected = 0;

  for (const id of changeIds) {
    const status = getChangeItemStatus(book.reviewState, id);
    if (status === 'approved') approved += 1;
    else if (status === 'rejected') rejected += 1;
  }

  const total = changeIds.length;
  const pending = total - approved - rejected;

  return {
    total,
    approved,
    rejected,
    pending,
    allApproved: total > 0 && approved === total,
    allReviewed: total > 0 && pending === 0,
    changeIds,
  };
}

export function buildOptimisticReviewState(
  book: PendingBook,
  changeId: string,
  decision: 'approved' | 'rejected',
): ReviewState {
  const prior: ReviewState = {
    checklist: { ...book.reviewState?.checklist },
    pdfReview: book.reviewState?.pdfReview ?? {
      status: 'pending',
      comment: null,
      reviewedAt: null,
      reviewedBy: null,
    },
    audioReview: book.reviewState?.audioReview ?? {
      status: 'pending',
      comment: null,
      reviewedAt: null,
      reviewedBy: null,
    },
    changeDecisions: { ...book.reviewState?.changeDecisions },
  };

  if (changeId === 'content_pdf') {
    return {
      ...prior,
      pdfReview: {
        ...prior.pdfReview,
        status: decision,
        reviewedAt: new Date().toISOString(),
      },
    };
  }
  if (changeId === 'content_audio') {
    return {
      ...prior,
      audioReview: {
        ...prior.audioReview,
        status: decision,
        reviewedAt: new Date().toISOString(),
      },
    };
  }

  return {
    ...prior,
    changeDecisions: {
      ...prior.changeDecisions,
      [changeId]: decision,
    },
  };
}
