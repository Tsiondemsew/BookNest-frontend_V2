import { NextResponse } from 'next/server';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@booknest.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await request.json();
  const email = body?.email;
  const password = body?.password;

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const response = NextResponse.json({
      success: true,
      data: { email },
    });

    response.cookies.set('admin-session', 'true', {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24,
      sameSite: 'lax',
    });

    return response;
  }

  return NextResponse.json(
    {
      success: false,
      message: 'Invalid admin credentials. Please use the admin email and password.',
    },
    { status: 401 },
  );
}
