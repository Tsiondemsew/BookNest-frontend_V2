import { NextRequest, NextResponse } from 'next/server';
import { authApi } from '@/services/api/auth';

/**
 * POST /api/auth/logout
 * 
 * Logout endpoint that:
 * 1. Clears the HTTP-only auth_token cookie
 * 2. Invalidates session on backend
 */
export async function POST(request: NextRequest) {
  try {
    // Call backend logout to invalidate session
    await authApi.logout();

    // Clear the HTTP-only cookie
    const res = NextResponse.json({
      success: true,
      message: 'Logged out',
    });

    res.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Immediately expire
      path: '/',
    });

    return res;
  } catch (error) {
    console.error('[Auth API] Logout error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Logout failed' },
      { status: 500 }
    );
  }
}
