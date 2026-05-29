/** Routes guests can use without being redirected to login on 401 from /api/auth/me */
export const PUBLIC_ROUTE_PREFIXES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/auth',
  '/verify',
  '/resend-verification',
  '/market',
  '/checkout/result',
];

export function isPublicAppPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  if (pathname === '/') return true;

  return PUBLIC_ROUTE_PREFIXES.some((prefix) => {
    if (prefix === '/') return false;
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  });
}
