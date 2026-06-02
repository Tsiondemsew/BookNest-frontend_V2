'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import { isNavHrefActive } from '@/lib/navigation/navActive';
import type { SessionUser } from '@repo/types';

interface HeaderAccountMenuProps {
  user: SessionUser | null;
}

export function HeaderAccountMenu({ user }: HeaderAccountMenuProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const displayName =
    user?.publicName ||
    (user?.role === 'author'
      ? t('account.author')
      : user?.role === 'publisher'
        ? t('account.publisher')
        : user?.role === 'admin'
          ? 'Admin'
          : t('account.reader'));
  const initial = displayName[0] || user?.email?.[0] || 'U';
  const avatarUrl = user?.avatarUrl?.trim() || null;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const handleOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    router.push('/');
  };

  const menuItems = [
    { label: t('account.myProfile'), href: '/@me', icon: User },
    { label: t('account.settings'), href: '/profile', icon: Settings },
  ];

  const roleLabel =
    user?.role === 'author'
      ? t('account.author')
      : user?.role === 'publisher'
        ? t('account.publisher')
        : t('account.reader');

  const isProfileActive =
    pathname === '/@me' ||
    pathname === '/me' ||
    pathname === '/profile';

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold transition-all ring-2 ring-offset-1 overflow-hidden ${
          isProfileActive || open
            ? 'bg-[#2C3E50] text-white ring-[#B85C38]/40'
            : 'bg-[#2C3E50] text-white ring-transparent hover:ring-[#E8E2D9]'
        }`}
        aria-label={t('account.accountMenu')}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={t('account.myProfile')}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          initial.toUpperCase()
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-[#E8E2D9] shadow-xl shadow-[#1A2A3A]/10 py-1.5 z-50 animate-[menuIn_0.18s_ease-out_both] origin-top-right"
        >
          <div className="px-3 py-2 border-b border-[#E8E2D9] mb-1 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-[#2C3E50] text-white flex items-center justify-center flex-shrink-0">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt=""
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-sm font-semibold">{initial.toUpperCase()}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#1A2A3A] truncate">{displayName}</p>
            <p className="text-xs text-[#4A5568] capitalize">{roleLabel}</p>
            </div>
          </div>

          {menuItems.map(({ label, href, icon: Icon }) => {
            const active =
              isNavHrefActive(pathname, href) ||
              (href === '/@me' && pathname === '/me');
            return (
              <Link
                key={href}
                href={href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 mx-1.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#2C3E50] text-white'
                    : 'text-[#4A5568] hover:bg-[#F5F1EB] hover:text-[#1A2A3A]'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}

          <div className="border-t border-[#E8E2D9] mt-1 pt-1 mx-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={() => void handleLogout()}
              className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} />
              {t('account.logOut')}
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes menuIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-4px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
