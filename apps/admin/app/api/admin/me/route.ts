import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { backendUrl } from '@/lib/api';
import { getAdminAccessToken } from '@/lib/admin-session';
import { buildAdminSessionPayload, verifyAdminAccessToken } from '@/lib/supabase/admin-auth';

export const dynamic = 'force-dynamic';

/**
 * Admin session — always includes saved profile (name, bio, avatar) when authenticated.
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
    const accessToken = await getAdminAccessToken();
    if (accessToken) {
      const backendRes = await fetch(backendUrl('/api/admin/me'), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Cookie: `token=${accessToken}`,
        },
        cache: 'no-store',
      });

      const payload = await backendRes.json();

      if (backendRes.ok && payload?.authenticated && payload?.data?.user) {
        return NextResponse.json({
          success: true,
          authenticated: true,
          data: payload.data,
        });
      }
    }
  } catch {
    /* try Supabase fallback */
  }

  try {
    const verified = await verifyAdminAccessToken(token);

    if (!verified.ok || !verified.userId) {
      return NextResponse.json({
        success: true,
        authenticated: false,
      });
    }

    const data = await buildAdminSessionPayload({
      userId: verified.userId,
      email: verified.email ?? verified.dbUser?.email ?? '',
      accountStatus: verified.dbUser?.account_status ?? 'active',
    });

    return NextResponse.json({
      success: true,
      authenticated: true,
      data,
    });
  } catch {
    return NextResponse.json({
      success: true,
      authenticated: false,
    });
  }
}
