import { NextResponse } from 'next/server';
import { getAdminAccessToken } from '@/lib/admin-session';
import { backendUrl } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const accessToken = await getAdminAccessToken();

  if (!accessToken) {
    return NextResponse.json(
      { success: false, error: { message: 'Not authenticated', code: 'UNAUTHORIZED' } },
      { status: 401 },
    );
  }

  const formData = await request.formData();
  const backendRes = await fetch(backendUrl('/api/admin/profile/avatar'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Cookie: `token=${accessToken}`,
    },
    body: formData,
  });

  const payload = await backendRes.json();
  return NextResponse.json(payload, { status: backendRes.status });
}
