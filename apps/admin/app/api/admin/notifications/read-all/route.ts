import { jsonAdminBackend } from '@/lib/admin-api-route';

export const dynamic = 'force-dynamic';

export async function PATCH() {
  const apiPath = '/api/admin/notifications/read-all';
  return jsonAdminBackend(apiPath, { method: 'PATCH' });
}
