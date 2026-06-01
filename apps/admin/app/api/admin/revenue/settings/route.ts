import { jsonAdminBackend } from '@/lib/admin-api-route';

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiPath = '/api/admin/revenue/settings';
  return jsonAdminBackend(apiPath);
}

export async function PATCH(request: Request) {
  const apiPath = '/api/admin/revenue/settings';
  const body = await request.text();
  return jsonAdminBackend(apiPath, { method: 'PATCH', body });
}
