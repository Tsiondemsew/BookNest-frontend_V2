import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { backendUrl } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, error: { message: 'Not authenticated', code: 'UNAUTHORIZED' } },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => ({}));

  const backendRes = await fetch(backendUrl('/api/admin/profile'), {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      Cookie: `token=${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const payload = await backendRes.json();
  return NextResponse.json(payload, { status: backendRes.status });
}

export async function POST(request: Request) {
  return PATCH(request);
}
