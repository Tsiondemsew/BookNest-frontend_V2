'use client';

import Link from 'next/link';
import { BookOpen, Library, Users, Sparkles } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

interface AuthPageShellProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  footer?: React.ReactNode;
}

export function AuthPageShell({ children, title, subtitle, footer }: AuthPageShellProps) {
  const { t } = useTranslation();

  const highlights = [
    { icon: Library, text: t('auth.highlightLibrary') },
    { icon: Users, text: t('auth.highlightCommunity') },
    { icon: Sparkles, text: t('auth.highlightStreaks') },
  ];

  return (
    <div className="h-dvh overflow-hidden flex flex-col lg:flex-row bg-[#FDFBF7]">
      <aside className="relative hidden lg:block flex-shrink-0 lg:fixed lg:inset-y-0 lg:left-0 lg:w-[44%] xl:w-[42%] lg:h-dvh overflow-hidden bg-[#1A2A3A] text-white z-20">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2C3E50] via-[#1A2A3A] to-[#152028]" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#B85C38]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#8E735B]/15 rounded-full blur-3xl pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative z-10 flex flex-col h-full p-5 sm:p-6 lg:p-10 xl:p-12 overflow-hidden">
          <Link href="/" className="inline-flex items-center gap-2.5 group w-fit flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-colors">
              <BookOpen className="w-5 h-5 text-[#B85C38]" />
            </div>
            <span className="text-xl font-bold tracking-tight">BookNest</span>
          </Link>

          <div className="hidden lg:flex flex-1 flex-col justify-center py-8 max-w-md min-h-0">
            <p className="text-[#B85C38] text-sm font-semibold uppercase tracking-wider mb-4">
              {t('auth.readerPlatform')}
            </p>
            <h2 className="text-2xl xl:text-4xl font-bold leading-tight tracking-tight">
              {t('auth.brandTitle')}
            </h2>
            <p className="mt-4 text-white/65 leading-relaxed text-sm xl:text-base">
              {t('auth.brandSubtitle')}
            </p>

            <ul className="mt-8 xl:mt-10 space-y-3 xl:space-y-4">
              {highlights.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-white/80">
                  <span className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-[#B85C38]" />
                  </span>
                  <span className="text-sm">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="hidden lg:block text-xs text-white/40 flex-shrink-0 pt-6">
            © {new Date().getFullYear()} BookNest
          </p>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-0 lg:ml-[44%] xl:ml-[42%] h-dvh overflow-hidden">
        <header className="lg:hidden flex-shrink-0 border-b border-[#E8E2D9] bg-white/90 backdrop-blur-sm">
          <div className="px-4 sm:px-6 py-3.5 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#B85C38]" />
              <span className="font-bold text-[#1A2A3A]">BookNest</span>
            </Link>
            <LanguageSwitcher variant="compact" />
          </div>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          <div className="min-h-full flex items-center justify-center px-4 sm:px-6 py-8 sm:py-10 lg:py-12">
            <div className="w-full max-w-[420px] my-auto">
              <div className="bn-auth-surface bg-white rounded-2xl border border-[#E8E2D9] shadow-sm shadow-[#2C3E50]/5 p-6 sm:p-8">
                <div className="mb-6 sm:mb-7">
                  <h1 className="text-2xl sm:text-[1.65rem] font-bold text-[#1A2A3A] tracking-tight">
                    {title}
                  </h1>
                  <p className="text-[#4A5568] mt-1.5 text-sm leading-relaxed">{subtitle}</p>
                </div>

                {children}

                {footer && (
                  <div className="mt-6 pt-5 border-t border-[#E8E2D9] text-center">
                    {footer}
                  </div>
                )}
              </div>

              <div className="hidden lg:flex mt-5 justify-center">
                <LanguageSwitcher variant="inline" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
