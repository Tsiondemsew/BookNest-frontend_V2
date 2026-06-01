import { cookies } from 'next/headers';
import { resolveAccessToken } from '@/lib/supabase/admin-auth';

/** Read session cookie and resolve to Supabase access token for backend API calls. */
export async function getAdminAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get('token')?.value;
  if (!cookieValue) return null;
  return resolveAccessToken(cookieValue);
}
