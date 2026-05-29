import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

export type RenderParams = {
  fitWidth: boolean;
  zoomLevel: number;
  containerWidth: number;
  canvasBg: string;
};

export type CachedPage = {
  width: number;
  height: number;
  bitmap: ImageBitmap;
};

function cacheKey(page: number, p: RenderParams): string {
  return `${page}-${p.fitWidth}-${p.zoomLevel}-${Math.round(p.containerWidth)}`;
}

export class PdfPageCache {
  private cache = new Map<string, CachedPage>();
  private inflight = new Map<string, Promise<CachedPage | null>>();

  clear() {
    for (const entry of this.cache.values()) {
      entry.bitmap.close();
    }
    this.cache.clear();
    this.inflight.clear();
  }

  get(page: number, params: RenderParams): CachedPage | null {
    return this.cache.get(cacheKey(page, params)) ?? null;
  }

  async renderPage(
    pdfDoc: PDFDocumentProxy,
    pageNum: number,
    params: RenderParams
  ): Promise<CachedPage | null> {
    const key = cacheKey(pageNum, params);
    const hit = this.cache.get(key);
    if (hit) return hit;

    const existing = this.inflight.get(key);
    if (existing) return existing;

    const task = this.doRender(pdfDoc, pageNum, params, key);
    this.inflight.set(key, task);
    try {
      return await task;
    } finally {
      this.inflight.delete(key);
    }
  }

  private async doRender(
    pdfDoc: PDFDocumentProxy,
    pageNum: number,
    params: RenderParams,
    key: string
  ): Promise<CachedPage | null> {
    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = this.getViewport(page, params);
      const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);

      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      await page.render({
        canvas,
        canvasContext: ctx,
        viewport,
        background: params.canvasBg,
      }).promise;

      const bitmap = await createImageBitmap(canvas);
      const entry: CachedPage = {
        width: viewport.width,
        height: viewport.height,
        bitmap,
      };

      const old = this.cache.get(key);
      if (old) old.bitmap.close();
      this.cache.set(key, entry);
      return entry;
    } catch {
      return null;
    }
  }

  getViewport(page: PDFPageProxy, params: RenderParams) {
    const baseVp = page.getViewport({ scale: 1 });
    const fitScale = Math.max(0.5, (params.containerWidth - 24) / baseVp.width);
    const scale = (params.fitWidth ? fitScale : 1) * params.zoomLevel;
    return page.getViewport({ scale });
  }

  /** Prefetch neighbors in the background */
  prefetchAround(
    pdfDoc: PDFDocumentProxy,
    centerPage: number,
    numPages: number,
    params: RenderParams
  ) {
    const pages = new Set<number>();
    for (let d = -2; d <= 2; d++) {
      const p = centerPage + d;
      if (p >= 1 && p <= numPages) pages.add(p);
    }
    for (const p of pages) {
      if (p === centerPage) continue;
      const key = cacheKey(p, params);
      if (this.cache.has(key) || this.inflight.has(key)) continue;
      void this.renderPage(pdfDoc, p, params);
    }
  }

  /** Warm cache after open — first chunk of pages */
  warmInitial(pdfDoc: PDFDocumentProxy, startPage: number, numPages: number, params: RenderParams) {
    const toPrefetch: number[] = [];
    for (let i = 1; i <= Math.min(4, numPages); i++) toPrefetch.push(i);
    if (startPage > 4) toPrefetch.push(startPage);
    if (startPage > 1) toPrefetch.push(startPage - 1);
    if (startPage < numPages) toPrefetch.push(startPage + 1);

    const unique = [...new Set(toPrefetch)].filter((p) => p >= 1 && p <= numPages);
    for (const p of unique) {
      void this.renderPage(pdfDoc, p, params);
    }
  }
}

export function paintBitmapToCanvas(
  canvas: HTMLCanvasElement,
  entry: CachedPage
) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(entry.width * dpr);
  canvas.height = Math.floor(entry.height * dpr);
  canvas.style.width = `${entry.width}px`;
  canvas.style.height = `${entry.height}px`;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, entry.width, entry.height);
  ctx.drawImage(entry.bitmap, 0, 0, entry.width, entry.height);
}
