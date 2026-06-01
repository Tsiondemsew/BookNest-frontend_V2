'use client';

import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AdminSessionProvider } from '@/context/admin-session-context';
import { Sidebar } from './sidebar';
import { SidebarProvider, useSidebar } from './sidebar-context';

function ShellBody({ children }: { children: ReactNode }) {
  const { collapsed, openSidebar, closeSidebar } = useSidebar();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />

      <button
        type="button"
        onClick={collapsed ? openSidebar : closeSidebar}
        className={`fixed top-1/2 z-30 flex h-10 w-6 -translate-y-1/2 items-center justify-center rounded-r-lg border border-l-0 border-border bg-card text-muted shadow-md transition hover:bg-surface hover:text-foreground ${
          collapsed ? 'left-0' : 'left-64'
        }`}
        aria-label={collapsed ? 'Show sidebar' : 'Hide sidebar'}
        title={collapsed ? 'Show sidebar' : 'Hide sidebar'}
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      <main
        className={`min-h-screen w-full bg-background transition-[margin] duration-300 ${
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
