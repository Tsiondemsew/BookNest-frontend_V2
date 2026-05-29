import { NextResponse } from 'next/server';
import { backendUrl } from '@/lib/api';

export const dynamic = 'force-dynamic';

/**
 * Admin login — validates against Express/Supabase (role=admin).
 * Sets httpOnly `token` cookie for dashboard + approval API routes.
 */
export async function POST(request: Request) {
  let body: { email?: string; password?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        message: 'Invalid request body.',
      },
      { status: 400 },
    );
  }

  const email = body?.email?.trim();
  const password = body?.password;

  if (!email || !password) {
    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        message: 'Email and password are required.',
      },
      { status: 400 },
    );
  }

  let backendRes: Response;

  try {
    backendRes = await fetch(backendUrl('/api/admin/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        message:
          'Cannot reach the API server. Start the backend on http://localhost:5000 and try again.',
      },
      { status: 503 },
    );
  }

  const payload = await backendRes.json();

  if (!backendRes.ok || payload?.success === false) {
    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        message:
          payload?.error?.message ||
          payload?.message ||
          'Invalid admin credentials. Please use your admin email and password.',
      },
      { status: backendRes.status >= 400 ? backendRes.status : 401 },
    );
  }

  const token = payload?.data?.token as string | undefined;

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        message: 'Login succeeded but no session token was returned.',
      },
      { status: 500 },
    );
  }

  const response = NextResponse.json({
    success: true,
    authenticated: true,
    data: {
      email,
      user: payload.data?.user ?? null,
    },
  });

  response.cookies.set('token', token, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return response;
}
