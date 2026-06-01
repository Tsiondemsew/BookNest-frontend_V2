import { NextResponse } from 'next/server';
import { fetchAdminBackend } from '@/lib/admin-backend-fetch';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.toString();
  const path = `/api/admin/notifications${query ? `?${query}` : ''}`;
  const backendRes = await fetchAdminBackend(path);

  const payload = await backendRes.json();
  return NextResponse.json(payload, { status: backendRes.status });
}
