import { jsonAdminBackend } from '@/lib/admin-api-route';

export const dynamic = 'force-dynamic';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return jsonAdminBackend(`/api/admin/users/${id}/approve`, { method: 'POST' });
}
