import { NextResponse } from 'next/server';
import { fetchAdminBackend } from '@/lib/admin-backend-fetch';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = searchParams.get('days') || '30';
  const path = `/api/admin/reports/user-growth?days=${encodeURIComponent(days)}`;

  const backendRes = await fetchAdminBackend(path);
  const payload = await backendRes.json();
  return NextResponse.json(payload, { status: backendRes.status });
}
