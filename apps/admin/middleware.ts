import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getClearCookieOptions } from '@/lib/auth-cookie';
import { isActiveSessionToken } from '@/lib/session-token';
import { looksLikeJwtAccessToken } from '@/lib/supabase/admin-auth';

function clearAuthCookies(response: NextResponse) {
  response.cookies.set('token', '', getClearCookieOptions());
  return response;
}

/** Fast cookie gate; full Supabase check runs in dashboard layout. */
export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;
  const hasSession = isActiveSessionToken(token);

  if (pathname.startsWith('/dashboard')) {
    if (!hasSession) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      if (token) return clearAuthCookies(response);
      return response;
    }
    return NextResponse.next();
  }

  // Only skip login for a valid access JWT. Refresh-token cookies must be verified
  // via /api/admin/me — otherwise stale tokens cause a login ↔ dashboard redirect loop.
  if (pathname === '/login' && hasSession && token && looksLikeJwtAccessToken(token)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
