import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { backendUrl } from '@/lib/api';

export const dynamic = 'force-dynamic';

/**
 * Admin session check — used by login page and client guards.
 * Returns { success, authenticated } (same shape as original admin app).
 */
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({
      success: true,
      authenticated: false,
    });
  }

  try {
    const backendRes = await fetch(backendUrl('/api/admin/me'), {
      headers: {
        Authorization: `Bearer ${token}`,
        Cookie: `token=${token}`,
      },
      cache: 'no-store',
    });

    const payload = await backendRes.json();

    if (!backendRes.ok || !payload?.authenticated) {
      return NextResponse.json({
        success: true,
        authenticated: false,
      });
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      data: payload.data ?? null,
    });
  } catch {
    return NextResponse.json({
      success: true,
      authenticated: false,
    });
  }
}
