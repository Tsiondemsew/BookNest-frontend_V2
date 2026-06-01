'use client';

import { useEffect, useRef, useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { Locale } from '@/i18n';

type LanguageSwitcherVariant = 'sidebar' | 'compact' | 'inline';

interface LanguageSwitcherProps {
  variant?: LanguageSwitcherVariant;
  collapsed?: boolean;
  className?: string;
}

export function LanguageSwitcher({
  variant = 'inline',
  collapsed = false,
  className = '',
}: LanguageSwitcherProps) {
  const { locale, setLocale, t, locales } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const options: Locale[] = ['en', 'am'];

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

  const triggerClass =
    variant === 'sidebar'
      ? `flex items-center ${collapsed ? 'justify-center w-full' : 'gap-3'} px-2.5 py-2 w-full rounded-lg text-sm font-medium text-[#4A5568] hover:bg-white transition-colors`
      : variant === 'compact'
        ? 'inline-flex items-center gap-1 text-xs text-[#4A5568] hover:text-[#B85C38] transition-colors px-2 py-1 rounded-lg hover:bg-[#F5F1EB]'
        : 'inline-flex items-center gap-1.5 text-sm text-[#4A5568] hover:text-[#B85C38] transition-colors px-2 py-1 rounded-lg hover:bg-[#F5F1EB]';

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={triggerClass}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('language.label')}
        title={collapsed ? t('language.label') : undefined}
      >
        <Globe size={variant === 'compact' ? 14 : 18} className="text-[#B85C38] shrink-0" />
        {!collapsed && variant !== 'compact' && (
          <>
            <span>{locales[locale].nativeLabel}</span>
            <span className={`${variant === 'sidebar' ? 'ml-auto' : ''} text-xs text-[#4A5568]`}>
              {locales[locale].code}
            </span>
          </>
        )}
        {variant === 'compact' && (
          <span className="font-semibold text-[#1A2A3A]">{locales[locale].code}</span>
        )}
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t('language.label')}
          className={`absolute z-50 min-w-[10rem] bg-white rounded-xl border border-[#E8E2D9] shadow-xl shadow-[#1A2A3A]/10 py-1 overflow-hidden ${
            variant === 'sidebar'
              ? collapsed
                ? 'left-full ml-2 bottom-0'
                : 'left-0 right-0 bottom-full mb-2'
              : 'right-0 top-full mt-1.5'
          }`}
        >
          {options.map((code) => {
            const active = code === locale;
            const info = locales[code];
            return (
              <li key={code} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => {
                    setLocale(code);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? 'bg-[#F5F1EB] text-[#1A2A3A] font-medium'
                      : 'text-[#4A5568] hover:bg-[#FDFBF7] hover:text-[#1A2A3A]'
                  }`}
                >
                  <span className="w-4 shrink-0">{active ? <Check size={14} className="text-[#B85C38]" /> : null}</span>
                  <span className="flex-1 text-left">{info.nativeLabel}</span>
                  <span className="text-xs text-[#4A5568]">{info.code}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
