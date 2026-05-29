'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'admin-sidebar-collapsed';

type SidebarContextValue = {
  collapsed: boolean;
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      setCollapsed(saved === 'true');
    }
    setReady(true);
  }, []);

  const persist = useCallback((next: boolean) => {
    setCollapsed(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  }, []);

  const toggleSidebar = useCallback(() => {
    setCollapsed((current) => {
      const next = !current;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const openSidebar = useCallback(() => persist(false), [persist]);
  const closeSidebar = useCallback(() => persist(true), [persist]);

  const value = useMemo(
    () => ({ collapsed: ready ? collapsed : false, toggleSidebar, openSidebar, closeSidebar }),
    [collapsed, ready, toggleSidebar, openSidebar, closeSidebar],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
}
