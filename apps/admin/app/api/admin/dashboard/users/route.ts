import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: [
      { date: '2026-01-01', readers: 450, authors: 90, total: 540 },
      { date: '2026-02-01', readers: 480, authors: 95, total: 575 },
      { date: '2026-03-01', readers: 520, authors: 100, total: 620 },
      { date: '2026-04-01', readers: 560, authors: 105, total: 665 },
      { date: '2026-05-01', readers: 600, authors: 110, total: 710 },
    ],
  });
}
