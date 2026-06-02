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
  BookOpenCheck,
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
    <div className="min-h-dvh flex bg-[#FDFBF7]">
      <aside className="w-60 shrink-0 h-dvh sticky top-0 border-r border-[#E8E2D9] bg-white flex flex-col overflow-hidden">
        <div className="px-4 py-5 border-b border-[#E8E2D9]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#2C3E50]/10 flex items-center justify-center">
              <BookOpenCheck className="w-5 h-5 text-[#B85C38]" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-[#4A5568]">BookNest</p>
              <h1 className="text-base font-semibold text-[#1A2A3A]">Admin</h1>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-hidden">
          {nav.map(({ href, label, icon: Icon }) => {
            const active =
              href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#2C3E50] text-white'
                    : 'text-[#4A5568] hover:bg-[#B85C38]/5 hover:text-[#1A2A3A]'
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-[#E8E2D9]">
          <p className="text-xs text-[#4A5568] truncate mb-2">{user?.email}</p>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#4A5568] hover:bg-[#FDFBF7]"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0 min-h-0 overflow-y-auto p-6 md:p-8">{children}</main>
    </div>
  );
}
