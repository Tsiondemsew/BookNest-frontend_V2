import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: [
      { date: '2026-01-01', revenue: 48000, orders: 420 },
      { date: '2026-02-01', revenue: 54000, orders: 450 },
      { date: '2026-03-01', revenue: 59000, orders: 470 },
      { date: '2026-04-01', revenue: 62000, orders: 500 },
      { date: '2026-05-01', revenue: 65500, orders: 525 },
    ],
  });
}
