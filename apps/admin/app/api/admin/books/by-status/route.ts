import { jsonAdminBackend } from '@/lib/admin-api-route';

export const dynamic = 'force-dynamic';

/** Proxies to backend list — avoids Next [id] catching "list" as a book id. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.toString();
  return jsonAdminBackend(`/api/admin/books/list${query ? `?${query}` : ''}`);
}
