const ACCESS_KEY = 'booknest:admin:accessToken';
const REFRESH_KEY = 'booknest:admin:refreshToken';

export function getAdminAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(ACCESS_KEY);
}

export function getAdminRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(REFRESH_KEY);
}

export function setAdminTokens(accessToken: string, refreshToken?: string | null): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(ACCESS_KEY, accessToken);
  if (refreshToken) {
    sessionStorage.setItem(REFRESH_KEY, refreshToken);
  }
}

/** @deprecated Use setAdminTokens */
export function setAdminAccessToken(token: string): void {
  setAdminTokens(token);
}

export function clearAdminAccessToken(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(ACCESS_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
}
