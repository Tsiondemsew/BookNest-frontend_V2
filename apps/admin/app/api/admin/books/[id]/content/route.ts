import { NextResponse } from 'next/server';
import { fetchAdminBackend } from '@/lib/admin-backend-fetch';
import { getAdminAccessToken } from '@/lib/admin-session';
import { demoUrlForFormat } from '@/lib/demo-content';

export const dynamic = 'force-dynamic';

function parseByteRange(rangeHeader: string | null, total: number) {
  if (!rangeHeader || total <= 0) return null;
  const match = /^bytes=(\d*)-(\d*)$/i.exec(rangeHeader.trim());
  if (!match) return null;
  let start = match[1] ? parseInt(match[1], 10) : 0;
  let end = match[2] ? parseInt(match[2], 10) : total - 1;
  if (Number.isNaN(start) || start < 0 || start >= total) return null;
  end = Math.min(end, total - 1);
  if (end < start) return null;
  return { start, end };
}

async function streamRemoteUrl(
  url: string,
  contentType: string,
  rangeHeader: string | null,
) {
  const headers: HeadersInit = {};
  if (rangeHeader) headers.Range = rangeHeader;

  const res = await fetch(url, { cache: 'no-store', headers });
  if (!res.ok && res.status !== 206) return null;

  const body = await res.arrayBuffer();
  const total = body.byteLength;
  const parsed = rangeHeader ? parseByteRange(rangeHeader, total) : null;

  if (parsed) {
    const { start, end } = parsed;
    const chunk = body.slice(start, end + 1);
    return new NextResponse(chunk, {
      status: 206,
      headers: {
        'Content-Type': res.headers.get('content-type') || contentType,
        'Cache-Control': 'private, max-age=300',
        'Accept-Ranges': 'bytes',
        'Content-Range': `bytes ${start}-${end}/${total}`,
        'Content-Length': String(chunk.byteLength),
        'X-Content-Source': 'demo-fallback',
      },
    });
  }

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': res.headers.get('content-type') || contentType,
      'Cache-Control': 'private, max-age=300',
      'Accept-Ranges': 'bytes',
      'Content-Length': String(total),
      'X-Content-Source': 'demo-fallback',
    },
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const accessToken = await getAdminAccessToken();

  if (!accessToken) {
    return NextResponse.json(
      { success: false, error: { message: 'Not authenticated', code: 'UNAUTHORIZED' } },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') === 'audio' ? 'audio' : 'pdf';
  const qs = `format=${format}`;

  const rangeHeader = request.headers.get('range');
  const backendRes = await fetchAdminBackend(`/api/admin/books/${id}/content?${qs}`, {
    headers: rangeHeader ? { Range: rangeHeader } : undefined,
  });
  if (backendRes.ok || backendRes.status === 206) {
    const contentType =
      backendRes.headers.get('content-type') ||
      (format === 'audio' ? 'audio/mpeg' : 'application/pdf');

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Cache-Control': 'private, max-age=300',
    };
    const contentSource = backendRes.headers.get('x-content-source');
    if (contentSource) headers['X-Content-Source'] = contentSource;

    const acceptRanges = backendRes.headers.get('accept-ranges');
    if (acceptRanges) headers['Accept-Ranges'] = acceptRanges;

    const contentRange = backendRes.headers.get('content-range');
    if (contentRange) headers['Content-Range'] = contentRange;

    const contentLength = backendRes.headers.get('content-length');
    if (contentLength) headers['Content-Length'] = contentLength;

    if (backendRes.body) {
      return new NextResponse(backendRes.body, { status: backendRes.status, headers });
    }

    const body = await backendRes.arrayBuffer();
    return new NextResponse(body, { status: backendRes.status, headers });
  }

  // Backend unavailable or upload missing — stream a public demo sample.
  let bookLanguage: string | null = searchParams.get('lang');
  if (!bookLanguage) {
    try {
      const bookRes = await fetchAdminBackend(`/api/admin/books/${id}`);
      if (bookRes.ok) {
        const payload = await bookRes.json();
        bookLanguage = payload?.data?.language ?? null;
      }
    } catch {
      /* use default demo */
    }
  }

  const demoUrl = demoUrlForFormat(format, bookLanguage);
  const fallback = await streamRemoteUrl(
    demoUrl,
    format === 'audio' ? 'audio/mpeg' : 'application/pdf',
    rangeHeader,
  );
  if (fallback) return fallback;

  const errText = await backendRes.text();
  let message = 'Could not load content';
  try {
    const json = JSON.parse(errText);
    message = json.error?.message || json.message || message;
  } catch {
    if (errText) message = errText.slice(0, 200);
  }
  return NextResponse.json(
    { success: false, error: { message, code: 'CONTENT_ERROR' } },
    { status: backendRes.status },
  );
}
