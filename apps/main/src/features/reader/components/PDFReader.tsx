'use client';

import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { loadBookFileBytes } from '@/lib/reader/loadBookFile';
import { handleReaderExitReview } from '@/lib/reader/reviewPrompt';
import {
  PdfPageCache,
  paintBitmapToCanvas,
  type RenderParams,
} from '@/lib/reader/pdfPageCache';
import { getReaderTheme, READER_THEMES, type ReaderThemeId } from './readerThemes';
import {
  Loader2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Settings2,
  X,
  Maximize2,
  Download,
} from 'lucide-react';

const loadPDFJS = async () => {
  const pdfjs = await import('pdfjs-dist');
  if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  }
  return pdfjs;
};

const ZOOM_STEPS = [0.75, 1, 1.25, 1.5, 1.75, 2, 2.5];
const SWIPE_THRESHOLD = 48;
const TAP_ZONE_RATIO = 0.28;

interface PDFReaderProps {
  bookFormatId: string;
  bookId: string;
  bookTitle: string;
  fileUrl: string;
  totalPages: number;
}

export function PDFReader({
  bookFormatId,
  bookId,
  bookTitle,
}: PDFReaderProps) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<import('pdfjs-dist').PDFDocumentProxy | null>(null);
  const pageCacheRef = useRef(new PdfPageCache());
  const maxPageReachedRef = useRef(1);
  const completedSessionRef = useRef(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const renderSlowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [pdfDoc, setPdfDoc] = useState<import('pdfjs-dist').PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showPageSpinner, setShowPageSpinner] = useState(false);
  const [fromCache, setFromCache] = useState(false);
  const [chromeVisible, setChromeVisible] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [themeId, setThemeId] = useState<ReaderThemeId>('warm');
  const [zoomIndex, setZoomIndex] = useState(2);
  const [fitWidth, setFitWidth] = useState(true);
  const [pageInput, setPageInput] = useState('1');

  const theme = getReaderTheme(themeId);
  const zoomLevel = ZOOM_STEPS[zoomIndex] ?? 1.25;

  const { progressPercent, lastPosition, updateProgress, isLoading: progressLoading } =
    useReadingProgress({
      bookFormatId,
      total: numPages,
      onComplete: () => {
        completedSessionRef.current = true;
      },
    });

  const getRenderParams = useCallback((): RenderParams => {
    const containerW = viewportRef.current?.clientWidth ?? window.innerWidth;
    return {
      fitWidth,
      zoomLevel,
      containerWidth: containerW,
      canvasBg: theme.canvasBg,
    };
  }, [fitWidth, zoomLevel, theme.canvasBg]);

  const displayPage = useCallback(
    async (pageNum: number) => {
      const doc = pdfDocRef.current;
      if (!doc || !canvasRef.current) return;

      const params = getRenderParams();
      const cache = pageCacheRef.current;

      const cached = cache.get(pageNum, params);
      if (cached) {
        paintBitmapToCanvas(canvasRef.current, cached);
        setShowPageSpinner(false);
        cache.prefetchAround(doc, pageNum, doc.numPages, params);
        return;
      }

      if (renderSlowTimerRef.current) clearTimeout(renderSlowTimerRef.current);
      renderSlowTimerRef.current = setTimeout(() => setShowPageSpinner(true), 120);

      const entry = await cache.renderPage(doc, pageNum, params);
      if (renderSlowTimerRef.current) {
        clearTimeout(renderSlowTimerRef.current);
        renderSlowTimerRef.current = null;
      }
      setShowPageSpinner(false);

      if (entry && canvasRef.current) {
        paintBitmapToCanvas(canvasRef.current, entry);
      }
      cache.prefetchAround(doc, pageNum, doc.numPages, params);
    },
    [getRenderParams]
  );

  const goToPage = useCallback(
    (page: number) => {
      const doc = pdfDocRef.current;
      const max = doc?.numPages ?? numPages;
      const next = Math.max(1, Math.min(max, page));
      setCurrentPage((prev) => (next === prev ? prev : next));
      setPageInput(String(next));
    },
    [numPages]
  );

  const goNext = useCallback(() => goToPage(currentPage + 1), [currentPage, goToPage]);
  const goPrev = useCallback(() => goToPage(currentPage - 1), [currentPage, goToPage]);

  useEffect(() => {
    return () => {
      handleReaderExitReview(bookId, bookTitle, completedSessionRef.current);
      pageCacheRef.current.clear();
      if (renderSlowTimerRef.current) clearTimeout(renderSlowTimerRef.current);
    };
  }, [bookId, bookTitle]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      pageCacheRef.current.clear();

      try {
        const pdfjs = await loadPDFJS();
        const { data, fromCache: cached } = await loadBookFileBytes(bookFormatId);
        if (cancelled) return;

        const doc = await pdfjs.getDocument({ data }).promise;
        if (cancelled) return;

        pdfDocRef.current = doc;
        const pages = doc.numPages;
        const start = lastPosition > 0 && lastPosition <= pages ? lastPosition : 1;

        setPdfDoc(doc);
        setNumPages(pages);
        setCurrentPage(start);
        setPageInput(String(start));
        maxPageReachedRef.current = start;
        setFromCache(cached);

        const params = {
          fitWidth: true,
          zoomLevel: ZOOM_STEPS[2],
          containerWidth: viewportRef.current?.clientWidth ?? window.innerWidth,
          canvasBg: getReaderTheme('warm').canvasBg,
        };

        await pageCacheRef.current.renderPage(doc, start, params);
        if (!cancelled && canvasRef.current) {
          const entry = pageCacheRef.current.get(start, params);
          if (entry) paintBitmapToCanvas(canvasRef.current, entry);
        }

        if (!cancelled) {
          pageCacheRef.current.warmInitial(doc, start, pages, params);
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load PDF');
          setIsLoading(false);
        }
      }
    };

    if (!progressLoading) load();

    return () => {
      cancelled = true;
    };
  }, [bookFormatId, progressLoading, lastPosition]);

  useLayoutEffect(() => {
    if (!pdfDoc || isLoading) return;
    void displayPage(currentPage);

    if (currentPage > maxPageReachedRef.current) {
      maxPageReachedRef.current = currentPage;
      void updateProgress(currentPage);
    }
  }, [pdfDoc, currentPage, isLoading, displayPage, updateProgress]);

  const themeZoomMountedRef = useRef(false);
  useEffect(() => {
    if (!pdfDoc || isLoading) return;
    if (!themeZoomMountedRef.current) {
      themeZoomMountedRef.current = true;
      return;
    }
    pageCacheRef.current.clear();
    void displayPage(currentPage);
  }, [themeId, zoomIndex, fitWidth, pdfDoc, isLoading, currentPage, displayPage]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (settingsOpen) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'Escape') setSettingsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev, settingsOpen]);

  const handleViewportClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const w = rect.width;
    if (x < w * TAP_ZONE_RATIO) {
      goPrev();
      return;
    }
    if (x > w * (1 - TAP_ZONE_RATIO)) {
      goNext();
      return;
    }
    setChromeVisible((v) => !v);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartRef.current;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    touchStartRef.current = null;
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy) * 1.2) return;
    if (dx < 0) goNext();
    else goPrev();
  };

  const commitPageInput = () => {
    const n = parseInt(pageInput, 10);
    if (!Number.isNaN(n)) goToPage(n);
    else setPageInput(String(currentPage));
  };

  if (isLoading || progressLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: theme.pageBg }}>
        <div className="text-center px-6">
          <Loader2 size={48} className="animate-spin mx-auto mb-4" style={{ color: theme.accent }} />
          <p className="font-medium" style={{ color: theme.text }}>Preparing your book…</p>
          <p className="text-sm mt-2" style={{ color: theme.textMuted }}>
            Loading and caching pages for smooth reading
          </p>
        </div>
      </div>
    );
  }

  if (loadError || !pdfDoc) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 px-6"
        style={{ background: theme.pageBg }}
      >
        <p className="text-center" style={{ color: theme.text }}>{loadError || 'Could not open this book.'}</p>
        <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded-lg text-white" style={{ background: theme.accent }}>
          Go back
        </button>
      </div>
    );
  }

  const atFirst = currentPage <= 1;
  const atLast = currentPage >= numPages;

  return (
    <div className="fixed inset-0 z-50 flex flex-col select-none" style={{ background: theme.pageBg, color: theme.text }}>
      <header
        className={`shrink-0 border-b transition-all duration-300 ${
          chromeVisible ? 'opacity-100' : 'h-0 opacity-0 overflow-hidden border-none pointer-events-none'
        }`}
        style={{ background: theme.chromeBg, borderColor: theme.chromeBorder }}
      >
        <div className="flex items-center gap-2 px-3 py-2.5">
          <button type="button" onClick={() => router.back()} className="p-2 rounded-lg" aria-label="Back">
            <ArrowLeft size={22} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-sm truncate">{bookTitle}</h1>
            <p className="text-xs" style={{ color: theme.textMuted }}>
              Page {currentPage} of {numPages}
              {fromCache && ' · Offline'}
            </p>
          </div>
          <button type="button" onClick={() => setSettingsOpen(true)} className="p-2 rounded-lg" aria-label="Settings">
            <Settings2 size={22} />
          </button>
        </div>
        <div className="px-4 pb-2">
          <div className="h-1 rounded-full overflow-hidden" style={{ background: theme.chromeBorder }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${progressPercent}%`, background: theme.accent }} />
          </div>
        </div>
      </header>

      <div
        ref={viewportRef}
        className="flex-1 overflow-auto overscroll-contain"
        onClick={handleViewportClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="min-h-full flex items-start justify-center py-6 px-4">
          <div className="relative" style={{ filter: theme.canvasFilter }}>
            <div
              className="relative rounded-sm"
              style={{ boxShadow: theme.pageGlow }}
            >
              <canvas ref={canvasRef} className="block max-w-none rounded-sm relative z-[1]" />
              <div
                className="absolute inset-0 rounded-sm pointer-events-none z-[2]"
                style={{ background: theme.lightOverlay, mixBlendMode: theme.lightBlendMode }}
              />
              <div
                className="absolute inset-0 rounded-sm pointer-events-none z-[3]"
                style={{ background: theme.vignette }}
              />
            </div>
            {showPageSpinner && (
              <div className="absolute inset-0 flex items-center justify-center z-[4] pointer-events-none">
                <Loader2 className="animate-spin opacity-60" size={28} style={{ color: theme.accent }} />
              </div>
            )}
          </div>
        </div>
      </div>

      <footer
        className={`shrink-0 border-t transition-all duration-300 ${
          chromeVisible ? 'opacity-100' : 'h-0 opacity-0 overflow-hidden pointer-events-none border-none'
        }`}
        style={{ background: theme.chromeBg, borderColor: theme.chromeBorder }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 px-3 py-3">
          <button
            type="button"
            onClick={goPrev}
            disabled={atFirst}
            className="flex items-center gap-1 px-4 py-2.5 rounded-xl font-medium disabled:opacity-40"
            style={{ background: theme.pageBg }}
          >
            <ChevronLeft size={20} />
            <span className="hidden sm:inline">Prev</span>
          </button>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={numPages}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onBlur={commitPageInput}
              onKeyDown={(e) => e.key === 'Enter' && commitPageInput()}
              className="w-14 text-center text-sm rounded-lg border py-1.5"
              style={{ background: theme.pageBg, borderColor: theme.chromeBorder, color: theme.text }}
            />
            <span className="text-sm" style={{ color: theme.textMuted }}>/ {numPages}</span>
          </div>
          <button
            type="button"
            onClick={goNext}
            disabled={atLast}
            className="flex items-center gap-1 px-4 py-2.5 rounded-xl font-medium text-white disabled:opacity-40"
            style={{ background: theme.accent }}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="flex items-center justify-center gap-3 px-3 pb-3" style={{ color: theme.textMuted }}>
          <button type="button" onClick={() => { setFitWidth(false); setZoomIndex((i) => Math.max(0, i - 1)); }} aria-label="Zoom out">
            <ZoomOut size={18} />
          </button>
          <span className="text-xs min-w-[4rem] text-center">{fitWidth ? 'Fit width' : `${Math.round(zoomLevel * 100)}%`}</span>
          <button type="button" onClick={() => { setFitWidth(false); setZoomIndex((i) => Math.min(ZOOM_STEPS.length - 1, i + 1)); }} aria-label="Zoom in">
            <ZoomIn size={18} />
          </button>
          <button type="button" onClick={() => { setFitWidth(true); setZoomIndex(2); }} aria-label="Fit width">
            <Maximize2 size={18} />
          </button>
        </div>
      </footer>

      {settingsOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close" onClick={() => setSettingsOpen(false)} />
          <div className="relative w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 shadow-xl max-h-[85vh] overflow-y-auto" style={{ background: theme.chromeBg }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Reading comfort</h2>
              <button type="button" onClick={() => setSettingsOpen(false)}><X size={20} /></button>
            </div>
            <p className="text-sm mb-2" style={{ color: theme.textMuted }}>
              Soft light and glow on the page reduce eye strain. Pick what feels best in your lighting.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
              {READER_THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setThemeId(t.id)}
                  className="rounded-xl border-2 p-3 text-xs font-medium text-left"
                  style={{
                    background: t.pageBg,
                    color: t.text,
                    borderColor: themeId === t.id ? theme.accent : t.chromeBorder,
                  }}
                >
                  <span className="block w-full h-6 rounded mb-1 border" style={{ background: t.canvasBg, boxShadow: t.pageGlow }} />
                  {t.label}
                </button>
              ))}
            </div>
            <p className="text-xs" style={{ color: theme.textMuted }}>
              Pages are cached when you open the book — turning pages should feel instant after the first load.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
