import type { SessionUser } from '@repo/types';
import { authApi } from '@/lib/api/client';

/**
 * Where to send the user after a successful login.
 * Readers without favorite genres are prompted to pick genres first.
 */
export function getPostLoginPath(
  user: SessionUser,
  options: {
    needsGenreOnboarding?: boolean;
    redirectTo?: string;
  } = {}
): string {
  const redirectTo = options.redirectTo || '/dashboard';

  if (user.role === 'reader' && options.needsGenreOnboarding) {
    const params = new URLSearchParams();
    if (redirectTo && redirectTo !== '/dashboard') {
      params.set('redirect', redirectTo);
    }
    const query = params.toString();
    return query ? `/onboarding/genres?${query}` : '/onboarding/genres';
  }

  return redirectTo;
}

/** Resolve path when user is already logged in (e.g. opened /login). */
export async function resolvePostLoginPath(
  user: SessionUser,
  redirectTo = '/dashboard'
): Promise<string> {
  if (user.role !== 'reader') {
    return redirectTo;
  }

  try {
    const res = await authApi.getFavoriteGenres();
    const hasGenres = Array.isArray(res.data) && res.data.length > 0;
    return getPostLoginPath(user, {
      needsGenreOnboarding: !hasGenres,
      redirectTo,
    });
  } catch {
    return redirectTo;
  }
}
