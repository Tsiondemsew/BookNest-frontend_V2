'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, X } from 'lucide-react';
import { followApi } from '@/lib/api/client';
import { CommunityAvatar, cn, ui } from '@/features/community/ui';
import type { FollowUser } from '@repo/types';

type FollowListKind = 'followers' | 'following';

interface FollowListModalProps {
  userId: string;
  kind: FollowListKind;
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

export function FollowListModal({ userId, kind, title, isOpen, onClose }: FollowListModalProps) {
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadList = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response =
        kind === 'followers'
          ? await followApi.getFollowers(userId, 1, 50)
          : await followApi.getFollowing(userId, 1, 50);
      const data = response.data;
      setUsers(kind === 'followers' ? data.followers || [] : data.following || []);
    } catch {
      setError('Unable to load this list right now.');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [kind, userId]);

  useEffect(() => {
    if (!isOpen) return;
    void loadList();
  }, [isOpen, loadList]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50">
      <div
        className="bg-white rounded-2xl border border-bn-border shadow-xl w-full max-w-md max-h-[min(80vh,520px)] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="follow-list-title"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-bn-border">
          <h2 id="follow-list-title" className="font-semibold text-bn-ink">
            {title}
          </h2>
          <button type="button" onClick={onClose} className={ui.btnIcon} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={28} className="animate-spin text-bn-primary" />
            </div>
          ) : error ? (
            <p className="text-center text-sm text-red-600 py-10 px-4">{error}</p>
          ) : users.length === 0 ? (
            <p className="text-center text-sm text-bn-muted py-10 px-4">
              {kind === 'followers' ? 'No followers yet.' : 'Not following anyone yet.'}
            </p>
          ) : (
            <ul className="divide-y divide-bn-border/60">
              {users.map((person) => {
                const slug = person.username || person.id;
                return (
                  <li key={person.id}>
                    <Link
                      href={`/${encodeURIComponent(slug)}`}
                      onClick={onClose}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-bn-surface/80 transition-colors"
                    >
                      <CommunityAvatar
                        name={person.name}
                        src={person.avatarUrl || undefined}
                        size="md"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm text-bn-ink truncate">{person.name}</p>
                        {person.username && (
                          <p className="text-xs text-bn-muted truncate">@{person.username}</p>
                        )}
                        {person.bio && (
                          <p className={cn(ui.caption, 'line-clamp-1 mt-0.5')}>{person.bio}</p>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
