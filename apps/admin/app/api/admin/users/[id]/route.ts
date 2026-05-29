import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { backendUrl } from '@/lib/api';

export const dynamic = 'force-dynamic';

async function proxyWithToken(path: string, init?: RequestInit) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, error: { message: 'Not authenticated', code: 'UNAUTHORIZED' } },
      { status: 401 },
    );
  }

  const backendRes = await fetch(backendUrl(path), {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Cookie: `token=${token}`,
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });

  const payload = await backendRes.json();
  return NextResponse.json(payload, { status: backendRes.status });
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyWithToken(`/api/admin/users/${id}`);
}
