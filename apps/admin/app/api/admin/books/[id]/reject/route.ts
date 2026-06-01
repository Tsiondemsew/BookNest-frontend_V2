import { proxyAdminRequest } from '@/lib/admin-api-proxy';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.text();
  return proxyAdminRequest(`/api/admin/books/${id}/reject`, {
    method: 'POST',
    body: body || '{}',
  });
}
