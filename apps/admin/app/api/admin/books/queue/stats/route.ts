import { NextResponse } from 'next/server';
import { fetchAdminBackend } from '@/lib/admin-backend-fetch';

export const dynamic = 'force-dynamic';

export async function GET() {
  const backendRes = await fetchAdminBackend('/api/admin/books/queue/stats');

  const payload = await backendRes.json();
  return NextResponse.json(payload, { status: backendRes.status });
}
