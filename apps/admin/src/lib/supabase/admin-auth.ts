import { cookies } from 'next/headers';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getAuthCookieOptions } from '@/lib/auth-cookie';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const refreshInflight = new Map<string, Promise<string | null>>();
const accessCache = new Map<string, { accessToken: string; expiresAt: number }>();

function requireSupabaseAuthConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase config. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in apps/admin/.env.local',
    );
  }
}

export function createSupabaseAuthClient(): SupabaseClient {
  requireSupabaseAuthConfig();
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function createSupabaseAdminClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export type AdminDbUser = {
  id: string;
  email: string;
  role: string;
  account_status: string;
};

export type AdminSessionPayload = {
  user: {
    id: string;
    email: string;
    role: string;
    account_status: string;
    publicName: string;
    avatarUrl: string | null;
    bio: string | null;
  };
  issuedAt: string;
  expiresAt: string;
};

function defaultNameFromEmail(email: string) {
  const base = email.split('@')[0].replace(/[._-]+/g, ' ').trim();
  return base.length >= 2 ? base : 'Admin User';
}

/** Load saved admin profile from auth metadata + admin_profiles (matches backend session shape). */
export async function buildAdminSessionPayload({
  userId,
  email,
  accountStatus,
}: {
  userId: string;
  email: string;
  accountStatus: string;
}): Promise<AdminSessionPayload> {
  const admin = createSupabaseAdminClient();
  let authMeta: Record<string, unknown> | null = null;
  let profile: { display_name?: string | null; avatar_url?: string | null; bio?: string | null } | null =
    null;

  if (admin) {
    const { data: authData } = await admin.auth.admin.getUserById(userId);
    authMeta = (authData?.user?.user_metadata as Record<string, unknown>) || null;

    const { data: row } = await admin
      .from('admin_profiles')
      .select('display_name, avatar_url, bio')
      .eq('user_id', userId)
      .maybeSingle();
    profile = row;
  }

  const metaName =
    (typeof authMeta?.display_name === 'string' && authMeta.display_name.trim()) ||
    (typeof authMeta?.displayName === 'string' && authMeta.displayName.trim()) ||
    (typeof authMeta?.full_name === 'string' && authMeta.full_name.trim()) ||
    '';

  let publicName =
    metaName ||
    (typeof profile?.display_name === 'string' && profile.display_name.trim()) ||
    defaultNameFromEmail(email);

  if (publicName.length < 2) publicName = 'Admin User';

  const avatarUrl =
    (typeof authMeta?.avatar_url === 'string' && authMeta.avatar_url) ||
    (typeof authMeta?.avatarUrl === 'string' && authMeta.avatarUrl) ||
    profile?.avatar_url ||
    null;

  const bio =
    (typeof authMeta?.bio === 'string' && authMeta.bio.trim()) ||
    (typeof profile?.bio === 'string' && profile.bio.trim()) ||
    null;

  const now = new Date();
  return {
    user: {
      id: userId,
      email,
      role: 'admin',
      account_status: accountStatus,
      publicName,
      avatarUrl,
      bio,
    },
    issuedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

export async function findAdminDbUser(userId: string): Promise<AdminDbUser | null> {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    console.error(
      '[admin-auth] SUPABASE_SERVICE_ROLE_KEY missing — add it to apps/admin/.env.local',
    );
    return null;
  }

  const { data, error } = await admin
    .from('users')
    .select('id, email, role, account_status')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('[admin-auth] users lookup failed:', error.message);
    return null;
  }
  if (!data) return null;
  return data as AdminDbUser;
}

/** Supabase access JWTs are three base64url segments; refresh tokens are opaque (often long, no dots). */
export function looksLikeJwtAccessToken(value: string): boolean {
  const parts = value.split('.');
  return parts.length === 3 && parts[0].startsWith('eyJ');
}

export function isRefreshTokenCookie(value: string | undefined): boolean {
  if (!value || value.length < 8) return false;
  return !looksLikeJwtAccessToken(value);
}

/** Turn cookie value (refresh token or legacy JWT) into a Supabase access token. */
export async function resolveAccessToken(cookieValue: string): Promise<string | null> {
  if (!cookieValue) return null;

  if (!isRefreshTokenCookie(cookieValue)) {
    return cookieValue;
  }

  const cached = accessCache.get(cookieValue);
  if (cached && cached.expiresAt > Date.now() + 60_000) {
    return cached.accessToken;
  }

  if (refreshInflight.has(cookieValue)) {
    return refreshInflight.get(cookieValue)!;
  }

  const promise = (async () => {
    const authClient = createSupabaseAuthClient();
    const { data, error } = await authClient.auth.refreshSession({
      refresh_token: cookieValue,
    });

    if (error || !data.session?.access_token) {
      return null;
    }

    const accessToken = data.session.access_token;
    const newRefresh = data.session.refresh_token;
    const expiresAt =
      Date.now() + (data.session.expires_in ?? 3600) * 1000 - 60_000;

    accessCache.set(cookieValue, { accessToken, expiresAt });
    if (newRefresh && newRefresh !== cookieValue) {
      accessCache.set(newRefresh, { accessToken, expiresAt });
      accessCache.delete(cookieValue);
      try {
        const cookieStore = await cookies();
        cookieStore.set('token', newRefresh, getAuthCookieOptions());
      } catch {
        /* ignore if cookies() unavailable */
      }
    }

    return accessToken;
  })().finally(() => {
    refreshInflight.delete(cookieValue);
  });

  refreshInflight.set(cookieValue, promise);
  return promise;
}

export async function verifyAdminAccessToken(cookieValue: string): Promise<{
  ok: boolean;
  userId?: string;
  email?: string;
  dbUser?: AdminDbUser;
}> {
  try {
    const accessToken = await resolveAccessToken(cookieValue);
    if (!accessToken) return { ok: false };

    const authClient = createSupabaseAuthClient();
    const {
      data: { user },
      error,
    } = await authClient.auth.getUser(accessToken);

    if (error || !user) {
      return { ok: false };
    }

    const dbUser = await findAdminDbUser(user.id);

    if (!dbUser || dbUser.role !== 'admin' || dbUser.account_status !== 'active') {
      return { ok: false };
    }

    return {
      ok: true,
      userId: user.id,
      email: user.email ?? dbUser.email,
      dbUser,
    };
  } catch {
    return { ok: false };
  }
}

export type SupabaseLoginResult =
  | { ok: true; refreshToken: string; email: string; userId: string }
  | { ok: false; message: string };

export async function loginAdminWithSupabase(
  email: string,
  password: string,
): Promise<SupabaseLoginResult> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return { ok: false, message: 'Email and password are required.' };
  }

  let authClient: SupabaseClient;
  try {
    authClient = createSupabaseAuthClient();
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Supabase is not configured.',
    };
  }

  const { data, error } = await authClient.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error || !data.session?.refresh_token || !data.user) {
    const msg = error?.message?.toLowerCase() ?? '';
    if (msg.includes('invalid') || msg.includes('credentials')) {
      return {
        ok: false,
        message:
          'Invalid email or password. Use your Supabase admin account (role = admin).',
      };
    }
    return {
      ok: false,
      message: error?.message || 'Could not sign in with Supabase.',
    };
  }

  const dbUser = await findAdminDbUser(data.user.id);

  if (!dbUser) {
    return {
      ok: false,
      message: 'Signed in to Supabase but no BookNest user record was found.',
    };
  }

  if (dbUser.role !== 'admin') {
    return {
      ok: false,
      message: 'This account is not an admin. Only users with role=admin can access this app.',
    };
  }

  if (dbUser.account_status !== 'active') {
    return {
      ok: false,
      message: 'Your admin account is not active. Contact support.',
    };
  }

  return {
    ok: true,
    refreshToken: data.session.refresh_token,
    email: dbUser.email,
    userId: data.user.id,
  };
}
