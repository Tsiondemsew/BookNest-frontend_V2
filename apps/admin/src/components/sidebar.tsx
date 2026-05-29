'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronLeft, Plus } from 'lucide-react';
import { useState } from 'react';
import { useSidebar } from './sidebar-context';
import { useTheme } from './theme-provider';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '▦' },
  { href: '/dashboard/users', label: 'Users', icon: '👥' },
  { href: '/dashboard/books', label: 'Approvals', icon: '✓' },
  { href: '/dashboard/reports', label: 'Reports', icon: '📋' },
];

const bottomItems = [
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙' },
  { href: '/dashboard/support', label: 'Support', icon: '?' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme, mounted } = useTheme();
  const { collapsed, closeSidebar } = useSidebar();
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

  const linkClass = (href: string) => {
    const isActive =
      pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
    return `mb-1 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
      isActive
        ? 'bg-violet-600 text-white'
        : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
    }`;
  };

  return (
    <>
      <aside
        className={`fixed left-0 top-0 z-20 flex h-screen w-64 flex-col bg-[#1e293b] text-slate-200 transition-transform duration-300 dark:border-r dark:border-slate-800 dark:bg-slate-950 ${
          collapsed ? '-translate-x-full' : 'translate-x-0'
        }`}
      >
        <div className="flex items-start justify-between border-b border-slate-700/80 px-6 py-6">
          <Link href="/dashboard" className="block min-w-0 flex-1">
            <p className="text-lg font-bold text-white">LibrarianPro</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Admin Console
            </p>
          </Link>
          <button
            type="button"
            onClick={closeSidebar}
            className="ml-2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-700/60 hover:text-white"
            aria-label="Hide sidebar"
            title="Hide sidebar"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass(item.href)}>
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}

          <Link
            href="/dashboard/books"
            className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-violet-500"
          >
            <Plus size={18} />
            New Submission
          </Link>
        </nav>

        <div className="border-t border-slate-700/80 px-3 py-4">
          <button
            type="button"
            onClick={toggleTheme}
            className="mb-2 w-full rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700/60"
          >
            {!mounted ? 'Theme' : theme === 'dark' ? '☀ Light mode' : '🌙 Dark mode'}
          </button>
          {bottomItems.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass(item.href)}>
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="mt-2 w-full rounded-lg border border-slate-600 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-700/60 disabled:opacity-60"
          >
            {loggingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </aside>
    </>
  );
}
