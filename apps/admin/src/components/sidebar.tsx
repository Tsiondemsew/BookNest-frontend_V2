'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  FileText,
  LayoutDashboard,
  LogOut,
  Mail,
  Settings,
  User,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { useAdminSession } from '@/hooks/useAdminSession';
import { useSidebar } from './sidebar-context';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/users', label: 'Users', icon: Users },
  { href: '/dashboard/invitations', label: 'Invitations', icon: Mail },
  { href: '/dashboard/books', label: 'Approvals', icon: CheckCircle2 },
  { href: '/dashboard/reports', label: 'Reports', icon: FileText },
];

const bottomItems = [
  { href: '/dashboard/profile', label: 'My Profile', icon: User },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { collapsed, closeSidebar } = useSidebar();
  const { displayName, email, initials } = useAdminSession();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
      router.replace('/login');
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  const isLinkActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    if (href === '/dashboard/profile') {
      return pathname === '/dashboard/profile' || pathname.startsWith('/dashboard/profile/');
    }
    if (href === '/dashboard/settings') {
      return pathname === '/dashboard/settings' || pathname.startsWith('/dashboard/settings/');
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const linkClass = (href: string) => {
    const isActive = isLinkActive(href);
    return `mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
      isActive
        ? 'bg-primary text-white'
        : 'text-muted hover:bg-surface hover:text-foreground'
    }`;
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-20 flex h-screen w-64 flex-col border-r border-border bg-card transition-transform duration-300 ${
        collapsed ? '-translate-x-full' : 'translate-x-0'
      }`}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-5">
        <Link href="/dashboard" className="flex min-w-0 flex-1 items-center gap-2">
          <BookOpen className="h-6 w-6 shrink-0 text-accent" />
          <div className="min-w-0">
            <p className="truncate text-xl font-bold text-foreground">BookNest</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
              Admin
            </p>
          </div>
        </Link>
        <button
          type="button"
          onClick={closeSidebar}
          className="rounded-lg bg-accent p-1.5 text-white transition hover:opacity-90"
          aria-label="Hide sidebar"
          title="Hide sidebar"
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      <div className="flex items-center gap-3 border-b border-border px-4 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
          <p className="truncate text-xs text-muted">{email}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className={linkClass(item.href)}>
            <item.icon size={18} className="shrink-0" />
            {item.label}
          </Link>
        ))}

      </nav>

      <div className="space-y-1 border-t border-border p-3">
        {bottomItems.map((item) => (
          <Link key={item.href} href={item.href} className={linkClass(item.href)}>
            <item.icon size={18} className="shrink-0" />
            {item.label}
          </Link>
        ))}
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-red-500/10 hover:text-red-500 disabled:opacity-60 dark:hover:bg-red-500/20"
        >
          <LogOut size={18} />
          {loggingOut ? 'Signing out…' : 'Logout'}
        </button>
      </div>
    </aside>
  );
}
