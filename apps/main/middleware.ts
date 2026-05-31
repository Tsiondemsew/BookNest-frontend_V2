import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** Rewrite /@username → /username for public profile pages */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/@') && pathname.length > 2) {
    const url = request.nextUrl.clone();
    url.pathname = `/${pathname.slice(2)}`;
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/@:path*', '/@'],
};
