import { NextRequest, NextResponse } from 'next/server';
import { authApi } from '@/services/api/auth';

/**
 * GET /api/auth/me
 * 
 * Verify current session and return user data.
 * Called during app initialization to restore auth state.
 * 
 * Authentication:
 * - Checks for valid auth_token HTTP-only cookie
 * - Returns 401 if no valid session
 */
export async function GET(request: NextRequest) {
  try {
    // Check for auth token cookie
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Call your backend's /me endpoint or mock API
    // In production, you'd verify the token with your backend
    const response = await authApi.me();

    return NextResponse.json({
      success: true,
      user: response.user,
    });
  } catch (error) {
    console.error('[Auth API] Me error:', error);
    return NextResponse.json(
      { error: 'Session invalid or expired' },
      { status: 401 }
    );
  }
}
