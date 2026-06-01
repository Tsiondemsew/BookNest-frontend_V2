import { NextResponse } from 'next/server';
import { backendUrl } from '@/lib/api';
import { getAdminAccessToken } from '@/lib/admin-session';

export async function proxyAdminRequest(
  path: string,
  init: RequestInit = {},
): Promise<NextResponse> {
  const accessToken = await getAdminAccessToken();

  if (!accessToken) {
    return NextResponse.json(
      { success: false, error: { message: 'Not authenticated', code: 'UNAUTHORIZED' } },
      { status: 401 },
    );
  }

  const backendRes = await fetch(backendUrl(path), {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Cookie: `token=${accessToken}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });

  const payload = await backendRes.json();
  return NextResponse.json(payload, { status: backendRes.status });
}
