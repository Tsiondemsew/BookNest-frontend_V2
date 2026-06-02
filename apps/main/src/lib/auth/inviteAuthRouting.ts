import { authApi } from '@/lib/api/client';

export function inviteRegistrationPath(search = '', hash = ''): string {
  return `/register/invite${search}${hash}`;
}

/** If the token belongs to an invited author/publisher, route to the invite registration form. */
export async function redirectIfInviteRegistration(
  accessToken: string,
  refreshToken: string | null | undefined,
  redirect: (path: string) => void,
  search = '',
  hash = ''
): Promise<boolean> {
  try {
    await authApi.invitePreview({
      access_token: accessToken,
      refresh_token: refreshToken ?? undefined,
    });
    redirect(inviteRegistrationPath(search, hash));
    return true;
  } catch {
    return false;
  }
}
