import { jsonAdminBackend } from '@/lib/admin-api-route';

export const dynamic = 'force-dynamic';

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return jsonAdminBackend(`/api/admin/notifications/${id}/read`, { method: 'PATCH' });
}
