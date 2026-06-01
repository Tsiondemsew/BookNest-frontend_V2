import { NextResponse } from 'next/server';
import { fetchAdminBackend } from '@/lib/admin-backend-fetch';

export const dynamic = 'force-dynamic';

export async function PATCH(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const backendRes = await fetchAdminBackend(`/api/admin/error-logs/${id}/unresolve`, {
    method: 'PATCH',
  });
  const payload = await backendRes.json();
  return NextResponse.json(payload, { status: backendRes.status });
}
