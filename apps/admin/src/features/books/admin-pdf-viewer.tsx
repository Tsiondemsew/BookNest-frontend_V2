'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getAdminFormatContentUrl,
  googleDrivePreviewUrl,
  isGoogleDriveUrl,
} from '@/lib/format-content-url';
import { DEMO_PDF_URL } from '@/lib/demo-content';

async function loadPdfJs() {
  const pdfjs = await import('pdfjs-dist');
  if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  }
  return pdfjs;
}

async function loadPdfDocument(pdfjs: Awaited<ReturnType<typeof loadPdfJs>>, url: string) {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error(`Could not load PDF (${res.status})`);
  const data = await res.arrayBuffer();
  const task = pdfjs.getDocument({ data });
  return task.promise;
}

type Props = {
  bookId: string;
  fileUrl?: string | null;
  fallbackUrl?: string | null;
  fileName?: string | null;
  title?: string;
  standalone?: boolean;
  /** In change cards: limit height */
  embedded?: boolean;
  /** Load this format's file URL before the book proxy (for "previous" column) */
  preferDirectSource?: boolean;
  /** Force reload when comparing two PDFs side by side */
  contentKey?: string;
};

export function AdminPdfViewer({
  bookId,
  fileUrl,
  fallbackUrl,
  fileName,
  title,
  standalone = false,
  embedded = false,
  preferDirectSource = false,
  contentKey,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasAreaRef = useRef<HTMLDivElement>(null);
  const [pdfDoc, setPdfDoc] = useState<{
    numPages: number;
    getPage: (n: number) => Promise<unknown>;
  } | null>(null);
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [pageJumpError, setPageJumpError] = useState<string | null>(null);
  const [fitScale, setFitScale] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [useGoogleEmbed, setUseGoogleEmbed] = useState(false);

  const proxyUrl = getAdminFormatContentUrl(bookId, 'pdf');
  const directFallback = fallbackUrl || fileUrl || DEMO_PDF_URL;
  const googleEmbed =
    fileUrl && isGoogleDriveUrl(fileUrl) ? googleDrivePreviewUrl(fileUrl) : null;

  const renderPage = useCallback(
    async (doc: typeof pdfDoc, pageNum: number, scale: number) => {
      if (!doc || !canvasRef.current) return;
      const pdfPage = (await doc.getPage(pageNum)) as {
        getViewport: (o: { scale: number }) => { width: number; height: number };
        render: (o: {
          canvasContext: CanvasRenderingContext2D;
          viewport: { width: number; height: number };
        }) => { promise: Promise<void> };
      };
      const viewport = pdfPage.getViewport({ scale });
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      canvas.style.maxWidth = '100%';
      canvas.style.width = '100%';
      canvas.style.height = 'auto';
      await pdfPage.render({ canvasContext: ctx, viewport }).promise;
    },
    [],
  );

  const updateFitScale = useCallback(async () => {
    if (!pdfDoc || !canvasAreaRef.current) return;
    const pdfPage = (await pdfDoc.getPage(page)) as {
      getViewport: (o: { scale: number }) => { width: number };
    };
    const baseViewport = pdfPage.getViewport({ scale: 1 });
    const availableWidth = canvasAreaRef.current.clientWidth - 24;
    if (availableWidth <= 0 || baseViewport.width <= 0) return;
    const nextFit = Math.min(2.5, Math.max(0.4, availableWidth / baseViewport.width));
    setFitScale(nextFit);
  }, [pdfDoc, page]);

  useEffect(() => {
    if (googleEmbed) {
      setUseGoogleEmbed(true);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      setUseGoogleEmbed(false);
      try {
        const pdfjs = await loadPdfJs();
        const ordered = preferDirectSource
          ? [directFallback, proxyUrl, DEMO_PDF_URL]
          : [proxyUrl, directFallback, DEMO_PDF_URL];
        const sources = ordered.filter((url, i, arr) => url && arr.indexOf(url) === i);
        let doc = null;
        let lastErr: Error | null = null;
        for (const url of sources) {
          try {
            doc = await loadPdfDocument(pdfjs, url);
            break;
          } catch (err) {
            lastErr = err instanceof Error ? err : new Error('Could not load PDF');
          }
        }
        if (!doc) {
          if (googleEmbed) {
            setUseGoogleEmbed(true);
            return;
          }
          throw lastErr || new Error('Could not load PDF');
        }
        if (cancelled) return;
        setPdfDoc(doc);
        setPage(1);
      } catch (e) {
        if (!cancelled) {
          if (googleEmbed) {
            setUseGoogleEmbed(true);
            setError(null);
          } else {
            setError(e instanceof Error ? e.message : 'Failed to load PDF');
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [proxyUrl, directFallback, googleEmbed, preferDirectSource, contentKey]);

  useEffect(() => {
    if (!pdfDoc || useGoogleEmbed) return;
    renderPage(pdfDoc, page, fitScale * zoom);
  }, [pdfDoc, page, fitScale, zoom, renderPage, useGoogleEmbed]);

  useEffect(() => {
    if (!pdfDoc || useGoogleEmbed) return;
    void updateFitScale();
    const area = canvasAreaRef.current;
    if (!area) return;
    const observer = new ResizeObserver(() => {
      void updateFitScale();
    });
    observer.observe(area);
    return () => observer.disconnect();
  }, [pdfDoc, page, useGoogleEmbed, updateFitScale]);

  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  const goToPage = useCallback(() => {
    const n = parseInt(pageInput.trim(), 10);
    const maxPages = pdfDoc?.numPages ?? 0;
    if (!pdfDoc || !Number.isFinite(n) || n < 1 || n > maxPages) {
      setPageJumpError(maxPages ? `Enter a page from 1 to ${maxPages}` : 'PDF still loading');
      return;
    }
    setPageJumpError(null);
    setPage(n);
    requestAnimationFrame(() => {
      canvasRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }, [pageInput, pdfDoc]);

  const changePage = useCallback((next: number) => {
    setPageJumpError(null);
    setPage(next);
  }, []);

  const shell = fullscreen
    ? 'fixed inset-0 z-50 flex flex-col bg-background'
    : standalone
      ? 'flex min-h-0 w-full flex-1 flex-col rounded-xl border border-border bg-card'
      : 'w-full rounded-xl border border-border bg-card';

  const canvasArea = standalone
    ? 'flex min-h-0 w-full flex-1 overflow-auto p-3 sm:p-4 justify-center items-start bg-muted/30'
    : 'max-h-[70vh] w-full overflow-auto p-3 sm:p-4 flex justify-center items-start bg-muted/30';

  const downloadHref = proxyUrl;

  return (
    <div ref={containerRef} className={shell}>
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2 text-sm">
        <span className="truncate font-medium">{title || fileName || 'PDF'}</span>
        {useGoogleEmbed && (
          <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-800 dark:bg-sky-950 dark:text-sky-200">
            Google preview
          </span>
        )}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {!useGoogleEmbed && (
            <>
              <button
                type="button"
                className="rounded-lg border border-border px-2 py-1"
                disabled={page <= 1}
                onClick={() => changePage(Math.max(1, page - 1))}
              >
                Prev
              </button>
              <span>
                {page} / {pdfDoc?.numPages ?? '—'}
              </span>
              <button
                type="button"
                className="rounded-lg border border-border px-2 py-1"
                disabled={!pdfDoc || page >= (pdfDoc?.numPages ?? 1)}
                onClick={() => changePage(page + 1)}
              >
                Next
              </button>
              <button
                type="button"
                className="rounded-lg border border-border px-2 py-1"
                onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
              >
                −
              </button>
              <button
                type="button"
                className="rounded-lg border border-border px-2 py-1"
                onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
              >
                +
              </button>
              <form
                className="flex items-center gap-1"
                onSubmit={(e) => {
                  e.preventDefault();
                  goToPage();
                }}
              >
                <input
                  type="number"
                  min={1}
                  max={pdfDoc?.numPages ?? undefined}
                  placeholder="Page"
                  value={pageInput}
                  onChange={(e) => {
                    setPageInput(e.target.value);
                    setPageJumpError(null);
                  }}
                  className="w-16 rounded-lg border border-border px-2 py-1 text-xs"
                  aria-label="Page number"
                />
                <button
                  type="submit"
                  className="rounded-lg border border-border px-2 py-1"
                  disabled={!pdfDoc}
                >
                  Go
                </button>
              </form>
              {pageJumpError && (
                <span className="text-[10px] text-red-600">{pageJumpError}</span>
              )}
            </>
          )}
          <a
            href={downloadHref}
            download={fileName || 'book.pdf'}
            className="rounded-lg border border-border px-2 py-1 hover:bg-muted"
          >
            Download
          </a>
          {fileUrl && isGoogleDriveUrl(fileUrl) && (
            <a
              href={googleDrivePreviewUrl(fileUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-border px-2 py-1 text-xs font-semibold text-primary hover:bg-muted"
            >
              Open in Google
            </a>
          )}
          {!useGoogleEmbed && (
            <button
              type="button"
              className="rounded-lg border border-border px-2 py-1"
              onClick={() => setFullscreen((f) => !f)}
            >
              {fullscreen ? 'Exit' : 'Fullscreen'}
            </button>
          )}
        </div>
      </div>
      <div ref={canvasAreaRef} className={canvasArea}>
        {loading && <p className="text-sm text-muted-foreground">Loading PDF…</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {useGoogleEmbed && googleEmbed && (
          <iframe
            src={googleEmbed}
            title={title || 'PDF preview'}
            className="h-full min-h-[70vh] w-full max-w-full rounded-lg border border-border bg-white"
            allow="autoplay"
          />
        )}
        {!loading && !error && !useGoogleEmbed && (
          <canvas ref={canvasRef} className="max-w-full shadow-lg" />
        )}
      </div>
    </div>
  );
}
