import { jsonAdminBackend } from '@/lib/admin-api-route';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.toString();
  return jsonAdminBackend(`/api/admin/invitations${query ? `?${query}` : ''}`);
}

export async function POST(request: Request) {
  const body = await request.text();
  return jsonAdminBackend('/api/admin/invitations', { method: 'POST', body });
}
