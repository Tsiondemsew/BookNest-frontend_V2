import { NextResponse } from 'next/server';
import { fetchAdminBackend } from '@/lib/admin-backend-fetch';

export const dynamic = 'force-dynamic';

export async function GET() {
  const backendRes = await fetchAdminBackend('/api/admin/settings');
  const payload = await backendRes.json();
  return NextResponse.json(payload, { status: backendRes.status });
}

export async function PATCH(request: Request) {
  const body = await request.text();
  const backendRes = await fetchAdminBackend('/api/admin/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  const payload = await backendRes.json();
  return NextResponse.json(payload, { status: backendRes.status });
}
