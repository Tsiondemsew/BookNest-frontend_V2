'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Menu, X } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslation } from '@/hooks/useTranslation';

export default function GuestLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/market', label: t('nav.marketplace') },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <nav className="bg-white/90 backdrop-blur-md border-b border-[#E8E2D9] sticky top-0 z-50 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-[#2C3E50]/8 flex items-center justify-center group-hover:bg-[#B85C38]/10 transition-colors">
                <BookOpen className="w-5 h-5 text-[#B85C38]" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-[#1A2A3A] tracking-tight">
                {t('pages.bookNest')}
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm text-[#4A5568] hover:text-[#B85C38] transition-colors font-medium"
                >
                  {label}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <LanguageSwitcher variant="compact" />
              <Link
                href="/login"
                className="px-4 py-2 text-sm text-[#2C3E50] font-medium hover:text-[#B85C38] transition-colors"
              >
                {t('common.signIn')}
              </Link>
              <Link
                href="/register"
                className="px-4 py-2.5 bg-[#2C3E50] text-white rounded-xl text-sm font-medium hover:bg-[#1A2A3A] transition-colors shadow-sm"
              >
                {t('auth.createAccount')}
              </Link>
            </div>

            <div className="flex md:hidden items-center gap-2">
              <LanguageSwitcher variant="compact" />
              <button
                type="button"
                onClick={() => setMobileOpen((o) => !o)}
                className="p-2 rounded-lg text-[#2C3E50] hover:bg-[#E8E2D9]/50 transition-colors"
                aria-label={mobileOpen ? t('nav.closeMenu') : t('nav.openMenu')}
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-[#E8E2D9] bg-white px-4 py-4 space-y-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-[#2C3E50] font-medium hover:bg-[#FDFBF7] transition-colors"
              >
                {label}
              </Link>
            ))}
            <div className="pt-3 mt-2 border-t border-[#E8E2D9] flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block text-center px-4 py-2.5 rounded-xl border border-[#E8E2D9] text-[#2C3E50] font-medium"
              >
                {t('common.signIn')}
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="block text-center px-4 py-2.5 rounded-xl bg-[#2C3E50] text-white font-medium"
              >
                {t('auth.createAccount')}
              </Link>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1">{children}</main>
    </div>
  );
}
