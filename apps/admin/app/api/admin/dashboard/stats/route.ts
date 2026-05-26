import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      totalRevenue: 219500,
      revenueChange: 12,
      totalUsers: 1200,
      usersChange: 7,
      totalReaders: 900,
      readersChange: 5,
      totalAuthors: 300,
      authorsChange: 11,
      pendingBooks: 14,
      pendingReports: 5,
      bannedUsers: 3,
    },
  });
}
