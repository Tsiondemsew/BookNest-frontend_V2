import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const BACKEND =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:5000';

async function isAdminAuthenticated(token: string | undefined): Promise<boolean> {
  if (!token) return false;

  try {
    const base = BACKEND.replace(/\/+$/, '');
    const res = await fetch(`${base}/api/admin/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Cookie: `token=${token}`,
      },
      cache: 'no-store',
    });

    const data = await res.json();
    return res.ok && Boolean(data?.authenticated);
  } catch {
    return false;
  }
}

function clearAuthCookies(response: NextResponse) {
  response.cookies.set('token', '', { path: '/', maxAge: 0 });
  response.cookies.set('admin-session', '', { path: '/', maxAge: 0 });
  return response;
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/dashboard')) {
    const ok = await isAdminAuthenticated(token);

    if (!ok) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      return clearAuthCookies(response);
    }

    return NextResponse.next();
  }

  if (pathname === '/login') {
    if (token && (await isAdminAuthenticated(token))) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (token) {
      const response = NextResponse.next();
      return clearAuthCookies(response);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
