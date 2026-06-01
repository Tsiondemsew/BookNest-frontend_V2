import { NextResponse } from 'next/server';
import { backendUrl } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const res = await fetch(backendUrl(`/api/invitations/accept/${token}/validate`), {
    cache: 'no-store',
  });
  const payload = await res.json();
  return NextResponse.json(payload, { status: res.status });
}
