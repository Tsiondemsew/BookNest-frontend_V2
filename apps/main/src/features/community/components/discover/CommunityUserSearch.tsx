'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, Loader2, UserPlus } from 'lucide-react';
import { usersApi } from '@/lib/api/client';
import { FollowButton } from '../profile/FollowButton';
import type { CommunityUserSearchResult } from '@repo/types';

export function CommunityUserSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CommunityUserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  return (
    <div className="bg-white rounded-2xl border border-[#E8E2D9] p-4 shadow-sm">
      <h3 className="font-semibold text-[#1A2A3A] mb-3 flex items-center gap-2">
        <UserPlus size={18} className="text-[#B85C38]" />
        Find people
      </h3>
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A5568]" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full pl-9 pr-3 py-2.5 text-sm border border-[#E8E2D9] rounded-xl focus:outline-none focus:border-[#B85C38] focus:ring-2 focus:ring-[#B85C38]/20"
        />
        {isSearching && (
          <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[#B85C38]" />
        )}
      </div>

      {query.length >= 2 && !isSearching && results.length === 0 && (
        <p className="text-sm text-[#4A5568] text-center py-4">No users found</p>
      )}

      <ul className="space-y-2 max-h-80 overflow-y-auto">
        {results.map((user) => (
          <li
            key={user.id}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#F5F1EB] transition-colors"
          >
            <Link
              href={`/@${encodeURIComponent(user.username || user.name)}`}
              className="flex items-center gap-3 flex-1 min-w-0"
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
    </div>
  );
}
