'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: '📊' },
  { href: '/dashboard/books', label: 'Books Review', icon: '📚' },
  { href: '/dashboard/users', label: 'Users', icon: '👥' },
  { href: '/dashboard/reports', label: 'Reports', icon: '⚠️' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-zinc-200 bg-white">
      {/* Logo */}
      <div className="border-b border-zinc-200 px-6 py-8">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">📖</span>
          <div>
            <p className="font-bold text-zinc-900">BookNest</p>
            <p className="text-xs text-zinc-500">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="px-4 py-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mb-2 flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-zinc-200 bg-zinc-50 px-6 py-4">
        <Link href="/" className="text-sm font-medium text-blue-600 hover:underline">
          ← Back to Main
        </Link>
      </div>
    </aside>
  );
}
