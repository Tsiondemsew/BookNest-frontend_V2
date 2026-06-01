import { jsonAdminBackend } from '@/lib/admin-api-route';

export const dynamic = 'force-dynamic';

export async function GET() {
  return jsonAdminBackend('/api/admin/users/stats');
}
