import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './src/i18n';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
});

// Protected routes that require authentication
const protectedPaths = [
  '/dashboard',
  '/reader',
  '/library',
  '/profile',
  '/settings',
  '/social',
  '/chat',
  '/admin',
];

// Public paths that don't require authentication
const publicPaths = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/',
];

function isProtectedPath(pathname: string): boolean {
  // Remove locale prefix for matching
  const pathWithoutLocale = pathname.replace(/^\/(en|am)\/?/, '/') || '/';
  return protectedPaths.some((path) => pathWithoutLocale.startsWith(path));
}

function isPublicPath(pathname: string): boolean {
  const pathWithoutLocale = pathname.replace(/^\/(en|am)\/?/, '/') || '/';
  return publicPaths.some((path) => pathWithoutLocale === path || pathWithoutLocale.startsWith(path));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check for auth token in cookies
  const token = request.cookies.get('auth_token')?.value;
  const hasAuth = !!token;

  // Apply intl middleware first
  const intlResponse = intlMiddleware(request);
  if (intlResponse) {
    return intlResponse;
  }

  // Redirect unauthenticated users trying to access protected routes
  if (isProtectedPath(pathname) && !hasAuth) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users trying to access auth pages to dashboard
  if (isPublicPath(pathname) && hasAuth && (pathname.includes('/login') || pathname.includes('/register'))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return intlResponse || NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
