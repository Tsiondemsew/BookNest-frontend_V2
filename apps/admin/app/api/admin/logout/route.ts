import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { backendUrl } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (token) {
    try {
      await fetch(backendUrl('/api/auth/logout'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Cookie: `token=${token}`,
        },
        cache: 'no-store',
      });
    } catch {
      // still clear local cookies
    }
  }

  const response = NextResponse.json({
    success: true,
    authenticated: false,
    message: 'Logged out successfully.',
  });

  response.cookies.set('token', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
  });

  response.cookies.set('admin-session', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
  });

  return response;
}
