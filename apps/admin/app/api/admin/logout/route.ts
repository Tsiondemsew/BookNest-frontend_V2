import { NextResponse } from 'next/server';
import { fetchAdminBackend } from '@/lib/admin-backend-fetch';
import { getClearCookieOptions } from '@/lib/auth-cookie';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    await fetchAdminBackend('/api/auth/logout', { method: 'POST' });
  } catch {
    // still clear local cookies
  }

  const response = NextResponse.json({
    success: true,
    authenticated: false,
    message: 'Logged out successfully.',
  });

  response.cookies.set('token', '', getClearCookieOptions());
  response.cookies.set('admin-session', '', getClearCookieOptions());

  return response;
}
