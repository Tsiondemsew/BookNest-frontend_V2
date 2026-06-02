const STORAGE_KEY = 'booknest:admin:accessToken';

export function getAdminAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(STORAGE_KEY);
}

export function setAdminAccessToken(token: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, token);
}

export function clearAdminAccessToken(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEY);
}
