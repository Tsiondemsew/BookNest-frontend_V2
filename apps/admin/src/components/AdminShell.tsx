'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Flag,
  Wallet,
  UserPlus,
  LogOut,
} from 'lucide-react';
import { useAdminAuthStore } from '@/stores/authStore';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/users', label: 'Users', icon: Users },
  { href: '/dashboard/books', label: 'Books', icon: BookOpen },
  { href: '/dashboard/reports', label: 'Reports', icon: Flag },
  { href: '/dashboard/withdrawals', label: 'Withdrawals', icon: Wallet },
  { href: '/dashboard/invites', label: 'Invites', icon: UserPlus },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAdminAuthStore();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <div className="min-h-dvh flex bg-zinc-100">
      <aside className="w-56 shrink-0 border-r border-zinc-200 bg-white flex flex-col">
        <div className="px-4 py-5 border-b border-zinc-200">
          <p className="text-xs uppercase tracking-widest text-zinc-500">BookNest</p>
          <h1 className="text-lg font-semibold text-zinc-900">Admin</h1>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map(({ href, label, icon: Icon }) => {
            const active =
              href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-zinc-200">
          <p className="text-xs text-zinc-500 truncate mb-2">{user?.email}</p>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0 p-6 md:p-8">{children}</main>
    </div>
  );
}
