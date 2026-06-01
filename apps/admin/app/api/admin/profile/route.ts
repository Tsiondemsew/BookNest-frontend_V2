import { jsonAdminBackend } from '@/lib/admin-api-route';

export const dynamic = 'force-dynamic';

export async function PATCH(request: Request) {
  const body = await request.text();
  return jsonAdminBackend('/api/admin/profile', {
    method: 'PATCH',
    body,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(request: Request) {
  const body = await request.text();
  return jsonAdminBackend('/api/admin/profile/name', {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/json' },
  });
}
