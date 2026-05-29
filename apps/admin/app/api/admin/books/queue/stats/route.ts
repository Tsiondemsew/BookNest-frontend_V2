import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { backendUrl } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, error: { message: 'Not authenticated', code: 'UNAUTHORIZED' } },
      { status: 401 },
    );
  }

  const backendRes = await fetch(backendUrl('/api/admin/books/queue/stats'), {
    headers: {
      Authorization: `Bearer ${token}`,
      Cookie: `token=${token}`,
    },
    cache: 'no-store',
  });

  const payload = await backendRes.json();
  return NextResponse.json(payload, { status: backendRes.status });
}
