import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: [
      { date: '2026-01-01', newBooks: 38, approvedBooks: 28, rejectedBooks: 10 },
      { date: '2026-02-01', newBooks: 42, approvedBooks: 31, rejectedBooks: 11 },
      { date: '2026-03-01', newBooks: 47, approvedBooks: 35, rejectedBooks: 12 },
      { date: '2026-04-01', newBooks: 52, approvedBooks: 40, rejectedBooks: 12 },
      { date: '2026-05-01', newBooks: 55, approvedBooks: 44, rejectedBooks: 11 },
    ],
  });
}
