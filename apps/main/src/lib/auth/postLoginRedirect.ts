import type { SessionUser } from '@repo/types';
import { authApi } from '@/lib/api/client';
import { DEFAULT_AUTHENTICATED_HOME, getDefaultHomeForRole } from '@/lib/routes/defaultRoutes';

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
  const requested = options.redirectTo || DEFAULT_AUTHENTICATED_HOME;
  const redirectTo =
    requested === DEFAULT_AUTHENTICATED_HOME ? getDefaultHomeForRole(user.role) : requested;

  if (user.role === 'reader' && options.needsGenreOnboarding) {
    const params = new URLSearchParams();
    if (redirectTo && redirectTo !== DEFAULT_AUTHENTICATED_HOME) {
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
  redirectTo = DEFAULT_AUTHENTICATED_HOME
): Promise<string> {
  const resolved =
    redirectTo === DEFAULT_AUTHENTICATED_HOME ? getDefaultHomeForRole(user.role) : redirectTo;

  if (user.role !== 'reader') {
    return resolved;
  }

  try {
    const res = await authApi.getFavoriteGenres();
    const hasGenres = Array.isArray(res.data) && res.data.length > 0;
    return getPostLoginPath(user, {
      needsGenreOnboarding: !hasGenres,
      redirectTo: resolved,
    });
  } catch {
    return resolved;
  }
}
