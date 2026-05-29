'use client';

import { useState } from 'react';
import type { FieldChange, PendingBook } from './types';

function truncate(text: string, max: number) {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}

function ChangeValue({
  value,
  variant,
  field,
  expanded,
  onToggle,
}: {
  value: string | null;
  variant: 'previous' | 'proposed';
  field: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  const isLong = field === 'description' && (value?.length ?? 0) > 280;
  const display =
    isLong && !expanded && value ? truncate(value, 280) : value || '—';

  const tone =
    variant === 'previous'
      ? 'text-slate-500 line-through decoration-slate-400'
      : 'text-slate-900 dark:text-slate-100';

  return (
    <div>
      <p className={`whitespace-pre-wrap text-sm ${tone}`}>{display}</p>
      {isLong && (
        <button
          type="button"
          onClick={onToggle}
          className="mt-1 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          {expanded ? 'Show less' : 'Show full text'}
        </button>
      )}
    </div>
  );
}

function CoverCompare({
  previousUrl,
  proposedUrl,
}: {
  previousUrl: string | null;
  proposedUrl: string | null;
}) {
  if (!previousUrl && !proposedUrl) return null;
  if (previousUrl === proposedUrl) return null;

  return (
    <div className="mt-4 grid grid-cols-2 gap-3">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Previous cover</p>
        {previousUrl ? (
          <img
            src={previousUrl}
            alt=""
            className="aspect-[2/3] w-full rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
          />
        ) : (
          <div className="flex aspect-[2/3] items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400 dark:bg-slate-800">
            None
          </div>
        )}
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase text-indigo-600 dark:text-indigo-400">
          Proposed cover
        </p>
        {proposedUrl ? (
          <img
            src={proposedUrl}
            alt=""
            className="aspect-[2/3] w-full rounded-lg object-cover ring-2 ring-indigo-400"
          />
        ) : (
          <div className="flex aspect-[2/3] items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400 dark:bg-slate-800">
            None
          </div>
        )}
      </div>
    </div>
  );
}

function ChangeRow({ change }: { change: FieldChange }) {
  const [expanded, setExpanded] = useState(false);

  if (change.field === 'cover_image_url') {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/50">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{change.label}</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase text-slate-400">Before</p>
          <ChangeValue
            value={change.previous}
            variant="previous"
            field={change.field}
            expanded={expanded}
            onToggle={() => setExpanded((e) => !e)}
          />
        </div>
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase text-indigo-500">After</p>
          <ChangeValue
            value={change.proposed}
            variant="proposed"
            field={change.field}
            expanded={expanded}
            onToggle={() => setExpanded((e) => !e)}
          />
        </div>
      </div>
    </div>
  );
}

export function ChangeDetailPanel({
  book,
  compact = false,
}: {
  book: PendingBook;
  compact?: boolean;
}) {
  const changes = book.changes ?? [];
  const isUpdate =
    book.submissionType === 'metadata_update' ||
    book.type === 'UPDATE' ||
    (changes.length > 0 && !book.isNewEntry);
  const prevCover = book.previous?.cover_image_url ?? null;
  const nextCover = book.proposed?.cover_image_url ?? book.coverImageUrl ?? null;
  const coverChanged = Boolean(
    changes.some((c) => c.field === 'cover_image_url') ||
      (prevCover && nextCover && prevCover !== nextCover),
  );

  return (
    <section
      className={`rounded-2xl border border-slate-200/80 bg-white dark:border-slate-700 dark:bg-slate-900 ${
        compact ? 'max-h-[min(70vh,520px)] overflow-y-auto p-4' : 'p-6 shadow-sm'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2
          className={`font-semibold text-slate-900 dark:text-white ${
            compact ? 'text-sm' : 'text-lg'
          }`}
        >
          {compact ? 'Change details' : 'Submission changes'}
        </h2>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
            isUpdate
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200'
              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200'
          }`}
        >
          {isUpdate ? 'Metadata update' : 'New entry'}
        </span>
      </div>

      {!compact && (
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Compare what the author changed against the last approved version.
        </p>
      )}

      {book.updateNote && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/40">
          <p className="text-xs font-bold uppercase text-amber-800 dark:text-amber-300">
            Author update note
          </p>
          <p className="mt-1 text-sm text-amber-950 dark:text-amber-100">{book.updateNote}</p>
        </div>
      )}

      {book.isResubmitted && (
        <p className="mt-3 text-sm text-violet-700 dark:text-violet-300">
          Submitted again after a prior review — check rejection history in Activity.
        </p>
      )}

      {changes.length === 0 && !coverChanged ? (
        <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-4 text-center dark:border-slate-600">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {isUpdate
              ? 'No field differences detected'
              : 'First-time submission'}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {isUpdate
              ? 'The author re-submitted without detectable metadata changes, or prior snapshot data is missing. Run the approval SQL script and approve books once to enable snapshots.'
              : 'All metadata is new — review the full book content before approving.'}
          </p>
        </div>
      ) : (
        <>
          {coverChanged && (
            <CoverCompare previousUrl={prevCover} proposedUrl={nextCover} />
          )}
          <div className={`space-y-3 ${coverChanged ? 'mt-4' : 'mt-4'}`}>
            {!compact && (
              <p className="text-xs font-semibold uppercase text-slate-500">
                {changes.filter((c) => c.field !== 'cover_image_url').length} field
                {changes.filter((c) => c.field !== 'cover_image_url').length !== 1
                  ? 's'
                  : ''}{' '}
                changed
              </p>
            )}
            {changes
              .filter((c) => c.field !== 'cover_image_url')
              .map((change) => (
                <ChangeRow key={change.field} change={change} />
              ))}
          </div>
        </>
      )}
    </section>
  );
}
