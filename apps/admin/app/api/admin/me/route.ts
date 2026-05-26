import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const cookieHeader = request.headers.get('cookie') ?? '';
  const authenticated = cookieHeader.includes('admin-session=true');

  return NextResponse.json({
    success: true,
    authenticated,
  });
}
