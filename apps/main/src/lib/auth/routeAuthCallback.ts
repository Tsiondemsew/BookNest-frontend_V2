/**
 * Route Supabase email links (hash or PKCE ?code=) to the correct in-app page.
 */
export function resolveAuthCallbackTarget(search: string, hash: string): string {
  const params = new URLSearchParams(search);
  const intent = params.get('intent');
  const type = params.get('type');

  const hashParams = hash.startsWith('#')
    ? new URLSearchParams(hash.slice(1))
    : hash
      ? new URLSearchParams(hash)
      : null;
  const hashType = hashParams?.get('type');

  const isRecovery =
    intent === 'recovery' ||
    type === 'recovery' ||
    hashType === 'recovery' ||
    hash.includes('type=recovery');

  if (isRecovery) {
    return `/reset-password${search}${hash}`;
  }

  const isVerify =
    intent === 'verify' ||
    type === 'signup' ||
    type === 'email' ||
    type === 'email_change' ||
    type === 'magiclink' ||
    hashType === 'signup' ||
    hashType === 'email' ||
    hashType === 'email_change' ||
    hashType === 'magiclink';

  if (isVerify) {
    return `/verify${search}${hash}`;
  }

  // PKCE links that fell back to Site URL (/) often arrive with ?code= only
  if (params.get('code')) {
    return `/reset-password${search}`;
  }

  if (hash.includes('access_token')) {
    return `/verify${hash}`;
  }

  return `/verify${search}${hash}`;
}
