import { jsonAdminBackend } from '@/lib/admin-api-route';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const apiPath = '/api/admin/users/bulk';
  const body = await request.text();
  return jsonAdminBackend(apiPath, { method: 'POST', body });
}
