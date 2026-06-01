import { NextResponse } from 'next/server';
import { backendUrl } from '@/lib/api';
import { getAdminAccessToken } from '@/lib/admin-session';

export const dynamic = 'force-dynamic';

const RESERVED_IDS = new Set(['list', 'pending', 'queue', 'by-status']);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (RESERVED_IDS.has(id)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: `Invalid book id "${id}". Use /api/admin/books/by-status or /api/admin/books/pending.`,
          code: 'BAD_REQUEST',
        },
      },
      { status: 400 },
    );
  }
  const accessToken = await getAdminAccessToken();

  if (!accessToken) {
    return NextResponse.json(
      { success: false, error: { message: 'Not authenticated', code: 'UNAUTHORIZED' } },
      { status: 401 },
    );
  }

  const backendRes = await fetch(backendUrl(`/api/admin/books/${id}`), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Cookie: `token=${accessToken}`,
    },
    cache: 'no-store',
  });

  const payload = await backendRes.json();
  return NextResponse.json(payload, { status: backendRes.status });
}
