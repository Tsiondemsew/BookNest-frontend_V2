import { proxyAdminRequest } from '@/lib/admin-api-proxy';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.text();
  return proxyAdminRequest(`/api/admin/books/${id}/review-state`, {
    method: 'PATCH',
    body,
  });
}
