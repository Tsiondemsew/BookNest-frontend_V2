import { cookies } from 'next/headers';
import { backendUrl } from './api';
import { getAdminAccessToken } from './admin-session';
import { resolveAccessToken, verifyAdminAccessToken } from './supabase/admin-auth';

export type AdminSession = {
  authenticated: boolean;
  email?: string;
  user?: unknown;
};

/** Verify admin session via Supabase JWT + users.role = admin. */
export async function verifyAdminSession(): Promise<AdminSession> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return { authenticated: false };
  }

  try {
    const verified = await verifyAdminAccessToken(token);

    if (!verified.ok) {
      return { authenticated: false };
    }

    return {
      authenticated: true,
      email: verified.email,
      user: {
        id: verified.userId,
        email: verified.email,
        role: 'admin',
        account_status: verified.dbUser?.account_status,
      },
    };
  } catch {
    return tryBackendSession();
  }
}

async function tryBackendSession(): Promise<AdminSession> {
  try {
    const accessToken = await getAdminAccessToken();
    if (!accessToken) return { authenticated: false };

    const res = await fetch(backendUrl('/api/admin/me'), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Cookie: `token=${accessToken}`,
      },
      cache: 'no-store',
    });

    const payload = await res.json();

    if (!res.ok || !payload?.authenticated) {
      return { authenticated: false };
    }

    const email =
      typeof payload?.data?.user?.email === 'string'
        ? payload.data.user.email
        : undefined;

    return {
      authenticated: true,
      email,
      user: payload.data,
    };
  } catch {
    return { authenticated: false };
  }
}

export async function verifyAdminToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;

  try {
    const verified = await verifyAdminAccessToken(token);
    if (verified.ok) return true;
  } catch {
    /* fallback */
  }

  try {
    const accessToken = await resolveAccessToken(token);
    if (!accessToken) return false;

    const res = await fetch(backendUrl('/api/admin/me'), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Cookie: `token=${accessToken}`,
      },
      cache: 'no-store',
    });

    const payload = await res.json();
    return res.ok && Boolean(payload?.authenticated);
  } catch {
    return false;
  }
}
