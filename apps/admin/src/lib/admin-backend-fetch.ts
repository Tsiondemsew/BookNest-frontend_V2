import { getAdminAccessToken } from '@/lib/admin-session';
import { backendUrl } from '@/lib/api';

/** Fetch backend admin API with a valid Supabase access token (not raw refresh token). */
export async function fetchAdminBackend(path: string, init: RequestInit = {}): Promise<Response> {
  const accessToken = await getAdminAccessToken();

  if (!accessToken) {
    return new Response(
      JSON.stringify({
        success: false,
        error: { message: 'Not authenticated', code: 'UNAUTHORIZED' },
      }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const url = path.startsWith('http') ? path : backendUrl(path);

  const headers = new Headers(init.headers as HeadersInit | undefined);

  if (
    init.body &&
    typeof init.body === 'string' &&
    init.body.length > 0 &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Cookie: `token=${accessToken}`,
      ...Object.fromEntries(headers.entries()),
    },
    cache: 'no-store',
  });
}
