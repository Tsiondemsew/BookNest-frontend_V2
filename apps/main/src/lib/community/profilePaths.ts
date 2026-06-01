/** Build a public profile URL. Uses user id so the profile always resolves. */
export function getProfilePath(user: { id: string; username?: string | null }, from?: string | null) {
  const base = `/@${encodeURIComponent(user.id)}`;
  if (!from) return base;
  const params = new URLSearchParams({ from });
  return `${base}?${params.toString()}`;
}

/** Fallback when browser history is empty. */
export function profileBackFallback(isOwnProfile?: boolean) {
  return isOwnProfile ? '/@me' : '/community';
}
