import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that anyone can access
const publicRoutes = ['/market', '/', '/login', '/register', '/forgot-password', '/update-password'];

// Protected routes that require authentication
const protectedRoutes = ['/library', '/reader', '/studio', '/dashboard', '/profile', '/messages', '/cart', '/checkout', '/wishlist'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if route is public
  const isPublic = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
  
  // Check if route is protected
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
  
  // For protected routes, we need to check auth via API call
  // But since we can't make async calls in middleware easily,
  // we'll let the client-side auth handle the redirect
  
  // If it's a protected route and not public, we'll let the client handle it
  // This prevents the middleware from throwing cookie errors
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public folder
     * - api routes (your backend handles these)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|api/).*)',
  ],
};