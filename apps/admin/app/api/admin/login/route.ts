import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getAuthCookieOptions } from '@/lib/auth-cookie';
import { loginAdminWithSupabase } from '@/lib/supabase/admin-auth';

export const dynamic = 'force-dynamic';

/**
 * Admin login — Supabase signInWithPassword + role=admin check.
 */
export async function POST(request: Request) {
  let body: { email?: string; password?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        message: 'Invalid request body.',
      },
      { status: 400 },
    );
  }

  const result = await loginAdminWithSupabase(
    String(body?.email ?? ''),
    String(body?.password ?? ''),
  );

  if (!result.ok) {
    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        message: result.message,
      },
      { status: 401 },
    );
  }

  const response = NextResponse.json({
    success: true,
    authenticated: true,
    data: {
      email: result.email,
      user: { id: result.userId, email: result.email, role: 'admin' },
    },
  });

  const cookieOptions = getAuthCookieOptions();
  response.cookies.set('token', result.refreshToken, cookieOptions);

  try {
    const cookieStore = await cookies();
    cookieStore.set('token', result.refreshToken, cookieOptions);
  } catch {
    // cookies() may be unavailable in some runtimes; Set-Cookie on response is enough
  }

  return response;
}
