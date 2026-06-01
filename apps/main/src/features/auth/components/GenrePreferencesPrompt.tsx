'use client';

import Link from 'next/link';
import { Sparkles, ChevronRight, X } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

type GenrePreferencesPromptProps = {
  redirectTo?: string;
  variant?: 'banner' | 'sidebar' | 'compact';
  dismissible?: boolean;
  dismissed?: boolean;
  onDismiss?: () => void;
};

function buildGenresHref(redirectTo: string) {
  const params = new URLSearchParams({ redirect: redirectTo });
  return `/onboarding/genres?${params.toString()}`;
}

export function GenrePreferencesPrompt({
  redirectTo = '/market',
  variant = 'banner',
  dismissible = false,
  dismissed = false,
  onDismiss,
}: GenrePreferencesPromptProps) {
  const { t } = useTranslation();
  const href = buildGenresHref(redirectTo);

  if (dismissible && dismissed) {
    return null;
  }

  if (variant === 'sidebar') {
    return (
      <Link
        href={href}
        className="flex items-start gap-2.5 rounded-xl border border-[#B85C38]/25 bg-gradient-to-br from-[#B85C38]/10 to-[#F5F1EB] p-3 text-left transition-colors hover:border-[#B85C38]/40 hover:from-[#B85C38]/15"
        title={t('genres.sidebarLink')}
      >
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#B85C38]/15 text-[#B85C38]">
          <Sparkles size={16} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-semibold text-[#1A2A3A] leading-snug">
            {t('genres.sidebarTitle')}
          </span>
          <span className="mt-0.5 block text-[10px] text-[#4A5568] leading-snug">
            {t('genres.sidebarHint')}
          </span>
        </span>
        <ChevronRight size={16} className="mt-1 flex-shrink-0 text-[#B85C38]" />
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link
        href={href}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#B85C38] hover:text-[#8E735B] transition-colors"
      >
        <Sparkles size={14} />
        {t('genres.pickGenresLink')}
        <ChevronRight size={14} />
      </Link>
    );
  }

  return (
    <div
      role="status"
      className="relative mb-6 flex flex-col gap-3 rounded-2xl border border-[#B85C38]/20 bg-gradient-to-r from-[#FFF8F5] to-[#F5F1EB] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
    >
      <div className="flex items-start gap-3 pr-8 sm:pr-0">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#B85C38]/15 text-[#B85C38]">
          <Sparkles size={20} />
        </span>
        <div>
          <p className="text-sm font-semibold text-[#1A2A3A]">{t('genres.bannerTitle')}</p>
          <p className="mt-0.5 text-sm text-[#4A5568]">{t('genres.bannerHint')}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 sm:flex-shrink-0">
        <Link
          href={href}
          className="inline-flex items-center justify-center gap-1 rounded-xl bg-[#2C3E50] px-4 py-2 text-sm font-medium text-white hover:bg-[#1A2A3A] transition-colors"
        >
          {t('genres.bannerCta')}
          <ChevronRight size={16} />
        </Link>
        <Link href={href} className="text-sm text-[#B85C38] hover:underline sm:hidden">
          {t('genres.pickGenresLink')}
        </Link>
      </div>
      {dismissible && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="absolute right-3 top-3 rounded-lg p-1 text-[#4A5568] hover:bg-white/80 hover:text-[#1A2A3A]"
          aria-label={t('genres.dismissBanner')}
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
