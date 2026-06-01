/** Default landing route after sign-in for readers. */
export const DEFAULT_AUTHENTICATED_HOME = '/community';

/** Studio dashboard for authors and publishers. */
export const STUDIO_HOME_PATH = '/studio';

/** Reading stats & streaks (readers only). */
export const READING_JOURNEY_PATH = '/dashboard/reading';

export function getDefaultHomeForRole(role?: string): string {
  if (role === 'author' || role === 'publisher') return STUDIO_HOME_PATH;
  return DEFAULT_AUTHENTICATED_HOME;
}
