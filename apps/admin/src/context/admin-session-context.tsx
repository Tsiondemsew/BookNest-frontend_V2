'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
export type AdminSessionUser = {
  id: string;
  email: string;
  role: string;
  account_status?: string;
  publicName?: string;
  avatarUrl?: string | null;
};

export type AdminSession = {
  user: AdminSessionUser;
  issuedAt?: string;
  expiresAt?: string;
};

function nameFromEmail(email: string) {
  return email.split('@')[0].replace(/[._]/g, ' ') || 'Admin User';
}

type AdminSessionContextValue = {
  session: AdminSession | null;
  loading: boolean;
  displayName: string;
  email: string;
  initials: string;
  avatarUrl: string | null;
  role: string;
  accountStatus: string;
  refresh: () => Promise<void>;
  applySession: (next: AdminSession | null) => void;
  patchDisplayName: (name: string) => void;
};

const AdminSessionContext = createContext<AdminSessionContextValue | null>(null);

export function AdminSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSession = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/me', { credentials: 'include', cache: 'no-store' });
      const payload = await res.json();
      if (payload?.authenticated && payload?.data?.user) {
        setSession(payload.data as AdminSession);
      } else {
        setSession(null);
      }
    } catch {
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const email = session?.user?.email ?? '';
  const displayName = session?.user?.publicName || (email ? nameFromEmail(email) : 'Admin User');
  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const applySession = useCallback((next: AdminSession | null) => {
    setSession(next);
    setLoading(false);
  }, []);

  const patchDisplayName = useCallback((name: string) => {
    setSession((prev) =>
      prev
        ? {
            ...prev,
            user: { ...prev.user, publicName: name },
          }
        : prev,
    );
    setLoading(false);
  }, []);

  const value = useMemo(
    () => ({
      session,
      loading,
      displayName,
      email,
      initials,
      avatarUrl: session?.user?.avatarUrl ?? null,
      role: session?.user?.role ?? 'admin',
      accountStatus: session?.user?.account_status ?? 'active',
      refresh: loadSession,
      applySession,
      patchDisplayName,
    }),
    [session, loading, displayName, email, initials, loadSession, applySession, patchDisplayName],
  );

  return <AdminSessionContext.Provider value={value}>{children}</AdminSessionContext.Provider>;
}

export function useAdminSession() {
  const context = useContext(AdminSessionContext);
  if (!context) {
    throw new Error('useAdminSession must be used within AdminSessionProvider');
  }
  return context;
}
