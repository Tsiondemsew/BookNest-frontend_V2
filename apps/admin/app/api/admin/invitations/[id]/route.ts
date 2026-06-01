import { jsonAdminBackend } from '@/lib/admin-api-route';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  return jsonAdminBackend(`/api/admin/invitations/${id}`);
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.text();
  return jsonAdminBackend(`/api/admin/invitations/${id}`, { method: 'PATCH', body });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  return jsonAdminBackend(`/api/admin/invitations/${id}`, { method: 'DELETE' });
}
