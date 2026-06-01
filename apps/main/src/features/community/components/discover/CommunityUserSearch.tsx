'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, Loader2, UserPlus, X } from 'lucide-react';
import { usersApi } from '@/lib/api/client';
import { FollowButton } from '../profile/FollowButton';
import { useTranslation } from '@/hooks/useTranslation';
import type { CommunityUserSearchResult } from '@repo/types';

interface CommunityUserSearchProps {
  /** Slim inline expander (legacy) */
  compact?: boolean;
  /** Full-width for header sheet */
  variant?: 'default' | 'sheet';
  onNavigate?: () => void;
}

export function CommunityUserSearch({
  compact = false,
  variant = 'default',
  onNavigate,
}: CommunityUserSearchProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CommunityUserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await usersApi.searchCommunityUsers(query.trim());
        setResults(res.data || []);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    if (!compact) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [compact]);

  const showResults = query.trim().length >= 2;

  const resultList = (
    <>
      {showResults && !isSearching && results.length === 0 && (
        <p className="text-sm text-[#4A5568] text-center py-4">{t('community.noUsersFound')}</p>
      )}
      <ul className={`space-y-1 ${compact ? 'p-2' : 'space-y-2'} max-h-72 overflow-y-auto`}>
        {results.map((user) => (
          <li
            key={user.id}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#F5F1EB] transition-colors"
          >
            <Link
              href={`/@${encodeURIComponent(user.username || user.name)}`}
              className="flex items-center gap-3 flex-1 min-w-0"
              onClick={() => {
                setExpanded(false);
                setQuery('');
                onNavigate?.();
              }}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2C3E50] to-[#B85C38] flex items-center justify-center text-white text-sm font-semibold overflow-hidden shrink-0">
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm text-[#1A2A3A] truncate">{user.name}</p>
                <p className="text-xs text-[#4A5568] capitalize">{user.role}</p>
              </div>
            </Link>
            <FollowButton userId={user.id} compact />
          </li>
        ))}
      </ul>
    </>
  );

  if (variant === 'sheet') {
    return (
      <div>
        <div className="relative mb-2">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A5568]" />
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('community.searchByName')}
            className="w-full pl-9 pr-10 py-3 text-sm border border-[#E8E2D9] rounded-xl focus:outline-none focus:border-[#B85C38] focus:ring-2 focus:ring-[#B85C38]/20 bg-[#FDFBF7]/50"
          />
          {isSearching && (
            <Loader2
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[#B85C38]"
            />
          )}
        </div>
        {resultList}
      </div>
    );
  }

  if (compact) {
    return (
      <div ref={rootRef} className="relative">
        {!expanded ? (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-[#E8E2D9] bg-white text-sm text-[#4A5568] hover:border-[#B85C38]/30 transition-colors"
          >
            <Search size={16} className="text-[#B85C38] shrink-0" />
            <span>{t('community.findPeople')}</span>
          </button>
        ) : (
          <div className="rounded-xl border border-[#E8E2D9] bg-white shadow-sm overflow-hidden">
            <div className="relative flex items-center">
              <Search size={16} className="absolute left-3 text-[#4A5568] pointer-events-none" />
              <input
                type="search"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('community.searchByName')}
                className="w-full pl-9 pr-10 py-2.5 text-sm border-0 focus:outline-none focus:ring-0 bg-transparent"
              />
              {isSearching ? (
                <Loader2
                  size={16}
                  className="absolute right-10 animate-spin text-[#B85C38]"
                />
              ) : null}
              <button
                type="button"
                onClick={() => {
                  setExpanded(false);
                  setQuery('');
                  setResults([]);
                }}
                className="absolute right-2 p-1.5 rounded-lg text-[#4A5568] hover:bg-[#F5F1EB]"
                aria-label={t('community.closeSearch')}
              >
                <X size={16} />
              </button>
            </div>
            {showResults && (
              <div className="border-t border-[#E8E2D9] max-h-64 overflow-y-auto">
                {resultList}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#E8E2D9] p-4 shadow-sm">
      <h3 className="font-semibold text-[#1A2A3A] mb-3 flex items-center gap-2">
        <UserPlus size={18} className="text-[#B85C38]" />
        {t('community.findPeople')}
      </h3>
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A5568]" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('community.searchByNameEmail')}
          className="w-full pl-9 pr-3 py-2.5 text-sm border border-[#E8E2D9] rounded-xl focus:outline-none focus:border-[#B85C38] focus:ring-2 focus:ring-[#B85C38]/20"
        />
        {isSearching && (
          <Loader2
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[#B85C38]"
          />
        )}
      </div>
      {resultList}
    </div>
  );
}
