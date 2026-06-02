/** Decode JWT exp claim (ms since epoch). Returns null if missing or invalid. */
export function getJwtExpiryMs(token: string): number | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64)) as { exp?: number };
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

/** True if token is missing or expires within skewMs (default 60s). */
export function isJwtExpired(token: string | null, skewMs = 60_000): boolean {
  if (!token) return true;
  const exp = getJwtExpiryMs(token);
  if (exp == null) return false;
  return Date.now() >= exp - skewMs;
}
