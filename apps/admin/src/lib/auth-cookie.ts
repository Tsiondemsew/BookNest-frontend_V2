/** Match backend cookieOptions — never use Secure on http://localhost */
export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax' as const,
    secure: process.env.COOKIE_SECURE === 'true',
  };
}

export function getClearCookieOptions() {
  return {
    httpOnly: true,
    path: '/',
    maxAge: 0,
    sameSite: 'lax' as const,
    secure: process.env.COOKIE_SECURE === 'true',
  };
}
