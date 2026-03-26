import { NextRequest, NextResponse } from 'next/server';
import { authApi } from '@/services/api/auth';

/**
 * POST /api/auth/login
 * 
 * Server-side login endpoint that:
 * 1. Calls backend authentication
 * 2. Sets HTTP-only cookie with auth token
 * 3. Returns user data to client
 * 
 * Frontend cannot access the HTTP-only cookie, ensuring security.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Call your backend API or mock API
    const response = await authApi.login(body);

    // Create response with user data
    const res = NextResponse.json({
      success: true,
      user: response.user,
    });

    // Set HTTP-only cookie with auth token
    // In production, your backend would set this cookie in the login response
    // For mock API, we simulate it here
    if (response.token) {
      res.cookies.set('auth_token', response.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });
    }

    return res;
  } catch (error) {
    console.error('[Auth API] Login error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Login failed' },
      { status: 401 }
    );
  }
}
