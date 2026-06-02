import { apiConfig } from '@/lib/api/config';
import {
  getAdminAccessToken,
  getAdminRefreshToken,
  setAdminTokens,
} from '@/lib/auth/adminToken';
import { isJwtExpired } from '@/lib/auth/jwt';

let refreshInFlight: Promise<boolean> | null = null;

/** Refresh Supabase access token using stored refresh token. Returns true if a new access token is available. */
export async function refreshAdminSessionIfNeeded(): Promise<boolean> {
  const access = getAdminAccessToken();
  if (access && !isJwtExpired(access)) {
    return true;
  }

  const refresh = getAdminRefreshToken();
  if (!refresh) {
    return false;
  }

  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const base = apiConfig.baseUrl.replace(/\/+$/, '');
        const res = await fetch(`${base}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ refresh_token: refresh }),
        });

        const body = await res.json();
        if (!res.ok || !body?.data?.accessToken) {
          return false;
        }

        setAdminTokens(body.data.accessToken, body.data.refreshToken ?? refresh);
        return true;
      } catch {
        return false;
      } finally {
        refreshInFlight = null;
      }
    })();
  }

  return refreshInFlight;
}
