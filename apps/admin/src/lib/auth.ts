import { cookies } from 'next/headers';
import { backendUrl } from './api';

export type AdminSession = {
  authenticated: boolean;
  email?: string;
  user?: unknown;
};

/** Verify admin session via backend Supabase auth (token cookie). */
export async function verifyAdminSession(): Promise<AdminSession> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return { authenticated: false };
  }

  try {
    const res = await fetch(backendUrl('/api/admin/me'), {
      headers: {
        Authorization: `Bearer ${token}`,
        Cookie: `token=${token}`,
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
    const res = await fetch(backendUrl('/api/admin/me'), {
      headers: {
        Authorization: `Bearer ${token}`,
        Cookie: `token=${token}`,
      },
      cache: 'no-store',
    });

    const payload = await res.json();
    return res.ok && Boolean(payload?.authenticated);
  } catch {
    return false;
  }
}
