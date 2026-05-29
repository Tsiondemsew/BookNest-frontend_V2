'use client';

import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AdminSessionProvider } from '@/context/admin-session-context';
import { Sidebar } from './sidebar';
import { SidebarProvider, useSidebar } from './sidebar-context';

function ShellBody({ children }: { children: ReactNode }) {
  const { collapsed, openSidebar, closeSidebar } = useSidebar();

  return (
    <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Sidebar />

      <button
        type="button"
        onClick={collapsed ? openSidebar : closeSidebar}
        className={`fixed top-1/2 z-30 flex h-10 w-6 -translate-y-1/2 items-center justify-center rounded-r-lg border border-l-0 border-zinc-200 bg-white text-zinc-600 shadow-md transition hover:bg-indigo-50 hover:text-indigo-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 ${
          collapsed ? 'left-0' : 'left-64'
        }`}
        aria-label={collapsed ? 'Show sidebar' : 'Hide sidebar'}
        title={collapsed ? 'Show sidebar' : 'Hide sidebar'}
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      <main
        className={`min-h-screen w-full bg-[var(--background)] transition-[margin] duration-300 ${
          collapsed ? 'ml-0' : 'ml-64'
        }`}
      >
        {children}
      </main>
    </div>
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AdminSessionProvider>
        <ShellBody>{children}</ShellBody>
      </AdminSessionProvider>
    </SidebarProvider>
  );
}
