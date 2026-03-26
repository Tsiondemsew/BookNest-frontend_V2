import { NextRequest, NextResponse } from 'next/server';
import { authApi } from '@/services/api/auth';

/**
 * POST /api/auth/register
 * 
 * Server-side registration endpoint that:
 * 1. Creates new user account
 * 2. Sets HTTP-only cookie with auth token
 * 3. Returns user data to client
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    if (!body.email || !body.password || !body.displayName) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, displayName' },
        { status: 400 }
      );
    }

    // Call backend registration or mock API
    const response = await authApi.register(body);

    // Create response with user data
    const res = NextResponse.json({
      success: true,
      user: response.user,
    });

    // Set HTTP-only cookie with auth token
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
    console.error('[Auth API] Register error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Registration failed' },
      { status: 400 }
    );
  }
}
