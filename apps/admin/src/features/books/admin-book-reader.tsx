'use client';

import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, Headphones } from 'lucide-react';
import { AdminPdfViewer } from './admin-pdf-viewer';
import { hasPlayableContent } from '@/lib/format-playback';
import { AdminAudioPlayer } from './admin-audio-player';
import { FormatMetadataBlock } from './format-metadata-block';
import type { BookFormatDetail, FormatSlots, PendingBook } from './types';
import { getApiErrorMessage } from '@/lib/api-error';

function buildFormatSlots(formats: BookFormatDetail[] | undefined): FormatSlots {
  const empty = (formatType: 'PDF' | 'Audio'): BookFormatDetail => ({
    id: null,
    formatType,
    price: null,
    currency: 'ETB',
    fileUrl: null,
    fileName: null,
    fileSizeBytes: null,
    pageCount: null,
    durationSec: null,
    uploadedAt: null,
    hasContent: false,
    missing: true,
  });
  const pdf = formats?.find((f) => f.formatType === 'PDF') ?? empty('PDF');
  const audio = formats?.find((f) => f.formatType === 'Audio') ?? empty('Audio');
  return { pdf, audio };
}

type ReaderFormat = 'pdf' | 'audio';

export function AdminBookReader() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const returnTo = searchParams.get('returnTo') || `/dashboard/books/${id}`;

  const [book, setBook] = useState<PendingBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFormat, setActiveFormat] = useState<ReaderFormat | null>(null);

  const loadBook = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/books/${id}`, { credentials: 'include' });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(getApiErrorMessage(payload, 'Failed to load book'));
      }
      setBook(payload.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadBook();
  }, [loadBook]);

  const formatSlots = useMemo(
    () => book?.formatSlots ?? buildFormatSlots(book?.formats),
    [book],
  );

  const hasPdf = Boolean(
    !formatSlots.pdf.missing &&
      (formatSlots.pdf.fileUrl || formatSlots.pdf.playbackUrl),
  );
  const hasAudio = Boolean(
    !formatSlots.audio.missing &&
      (formatSlots.audio.fileUrl || formatSlots.audio.playbackUrl),
  );

  useEffect(() => {
    if (!book || activeFormat) return;
    const requested = searchParams.get('format');
    if (requested === 'pdf' && hasPdf) {
      setActiveFormat('pdf');
      return;
    }
    if (requested === 'audio' && hasAudio) {
      setActiveFormat('audio');
      return;
    }
    if (hasPdf && !hasAudio) setActiveFormat('pdf');
    else if (hasAudio && !hasPdf) setActiveFormat('audio');
  }, [book, hasPdf, hasAudio, searchParams, activeFormat]);

  const openFormat = (format: ReaderFormat) => {
    setActiveFormat(format);
    const url = new URL(window.location.href);
    url.searchParams.set('format', format);
    router.replace(url.pathname + url.search, { scroll: false });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-8">
        <p className="text-red-600">{error || 'Book not found'}</p>
        <Link href={returnTo} className="text-sm font-semibold text-primary hover:underline">
          ← Back to review
        </Link>
      </div>
    );
  }

  if (!hasPdf && !hasAudio) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <ReaderHeader book={book} returnTo={returnTo} />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
          <p className="text-center text-muted-foreground">
            No PDF or audio files are available for this book yet.
          </p>
          <Link
            href={returnTo}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
          >
            Back to review
          </Link>
        </div>
      </div>
    );
  }

  if (!activeFormat) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <ReaderHeader book={book} returnTo={returnTo} />
        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-4 p-8">
          <h2 className="text-center text-lg font-semibold text-foreground">Choose a format</h2>
          <p className="text-center text-sm text-muted-foreground">
            Open the real submitted file in the admin reader.
          </p>
          {hasPdf && (
            <button
              type="button"
              onClick={() => openFormat('pdf')}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 text-left shadow-sm transition hover:border-primary hover:shadow-md"
            >
              <div className="rounded-xl bg-primary/10 p-3 text-primary">
                <BookOpen size={28} />
              </div>
              <div>
                <p className="font-semibold text-foreground">Read PDF</p>
                <p className="text-sm text-muted-foreground">
                  {formatSlots.pdf.fileName || 'PDF file'}
                  {formatSlots.pdf.pageCount != null ? ` · ${formatSlots.pdf.pageCount} pages` : ''}
                </p>
                {formatSlots.pdf.isDemoContent && (
                  <p className="mt-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                    {formatSlots.pdf.demoLabel || 'አማርኛ demo PDF — no upload on file yet'}
                  </p>
                )}
              </div>
            </button>
          )}
          {hasAudio && (
            <button
              type="button"
              onClick={() => openFormat('audio')}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 text-left shadow-sm transition hover:border-primary hover:shadow-md"
            >
              <div className="rounded-xl bg-primary/10 p-3 text-primary">
                <Headphones size={28} />
              </div>
              <div>
                <p className="font-semibold text-foreground">Listen to audio</p>
                <p className="text-sm text-muted-foreground">
                  {formatSlots.audio.fileName || 'Audio file'}
                </p>
              </div>
            </button>
          )}
        </div>
      </div>
    );
  }

  const format = activeFormat === 'pdf' ? formatSlots.pdf : formatSlots.audio;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ReaderHeader
        book={book}
        returnTo={returnTo}
        activeFormat={activeFormat}
        hasPdf={hasPdf}
        hasAudio={hasAudio}
        onSelectFormat={openFormat}
      />

      {format.isDemoContent && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-100">
          {format.demoLabel || 'Demo sample'} — no uploaded file for this format
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-2 sm:p-3">
          {activeFormat === 'pdf' && hasPlayableContent(format) && (
            <AdminPdfViewer
              bookId={id}
              fileUrl={format.fileUrl}
              fallbackUrl={format.playbackUrl}
              fileName={format.fileName}
              title={book.title}
              standalone
            />
          )}
          {activeFormat === 'audio' && hasPlayableContent(format) && (
            <div className="flex min-h-0 flex-1 flex-col">
              <AdminAudioPlayer
                bookId={id}
                format={format}
                bookTitle={book.title}
                bookDescription={book.description}
                standalone
              />
            </div>
          )}
          {!hasPlayableContent(format) && (
            <p className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
              No {activeFormat === 'pdf' ? 'PDF' : 'audio'} file available for playback.
            </p>
          )}
        </main>

        <aside className="flex w-full shrink-0 flex-col border-t border-border bg-card lg:max-h-[calc(100vh-3.5rem)] lg:w-64 xl:w-72 lg:overflow-y-auto lg:border-l lg:border-t-0">
          <div className="p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              File metadata
            </p>
            <div className="mt-3">
              <FormatMetadataBlock format={format} kind={activeFormat} />
            </div>
            <Link
              href={returnTo}
              className="mt-4 inline-flex w-full justify-center rounded-lg border border-border py-2.5 text-sm font-semibold text-foreground hover:bg-surface"
            >
              Back to book review
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ReaderHeader({
  book,
  returnTo,
  activeFormat,
  hasPdf,
  hasAudio,
  onSelectFormat,
}: {
  book: PendingBook;
  returnTo: string;
  activeFormat?: ReaderFormat;
  hasPdf?: boolean;
  hasAudio?: boolean;
  onSelectFormat?: (f: ReaderFormat) => void;
}) {
  return (
    <header className="flex shrink-0 flex-wrap items-center gap-3 border-b border-border bg-card px-4 py-3">
      <Link
        href={returnTo}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
      >
        <ArrowLeft size={16} />
        Back
      </Link>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-foreground">{book.title}</p>
        <p className="text-xs text-muted-foreground">Admin content reader</p>
      </div>
      {activeFormat && hasPdf && hasAudio && onSelectFormat && (
        <div className="flex gap-1 rounded-lg border border-border p-0.5">
          <button
            type="button"
            onClick={() => onSelectFormat('pdf')}
            className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold ${
              activeFormat === 'pdf' ? 'bg-primary text-white' : 'text-foreground'
            }`}
          >
            <BookOpen size={14} />
            PDF
          </button>
          <button
            type="button"
            onClick={() => onSelectFormat('audio')}
            className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold ${
              activeFormat === 'audio' ? 'bg-primary text-white' : 'text-foreground'
            }`}
          >
            <Headphones size={14} />
            Audio
          </button>
        </div>
      )}
    </header>
  );
}
