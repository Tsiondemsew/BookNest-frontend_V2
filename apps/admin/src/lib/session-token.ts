import { isRefreshTokenCookie } from '@/lib/supabase/admin-auth';

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** True when the session cookie looks usable (refresh token or non-expired JWT). */
export function isActiveSessionToken(token: string | undefined): boolean {
  if (!token || token.length < 8) return false;

  if (isRefreshTokenCookie(token)) {
    return true;
  }

  const payload = decodeJwtPayload(token);
  if (!payload) return false;

  const exp = payload.exp;
  if (typeof exp !== 'number') return false;

  return exp * 1000 > Date.now() + 30_000;
}
