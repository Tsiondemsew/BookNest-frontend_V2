export type ParsedAuthTokens = {
  accessToken: string;
  refreshToken: string | null;
  type: string | null;
};

/**
 * Read Supabase tokens from hash (#access_token=...) or query (?code=...).
 * For ?code=, pass an exchangeCode callback (e.g. supabase.auth.exchangeCodeForSession).
 */
export async function parseAuthTokensFromUrl(
  exchangeCode?: (code: string) => Promise<{ access_token?: string; refresh_token?: string } | null>
): Promise<ParsedAuthTokens | null> {
  if (typeof window === 'undefined') return null;

  const hash = window.location.hash.substring(1);
  if (hash) {
    const hashParams = new URLSearchParams(hash);
    const accessToken = hashParams.get('access_token');
    if (accessToken) {
      return {
        accessToken,
        refreshToken: hashParams.get('refresh_token'),
        type: hashParams.get('type'),
      };
    }
  }

  const search = new URLSearchParams(window.location.search);
  const code = search.get('code');
  if (code && exchangeCode) {
    const session = await exchangeCode(code);
    if (session?.access_token) {
      return {
        accessToken: session.access_token,
        refreshToken: session.refresh_token ?? null,
        type: search.get('type') || search.get('intent') || null,
      };
    }
  }

  return null;
}
