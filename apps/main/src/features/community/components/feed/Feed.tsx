'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { Users, Loader2, FileText, type LucideIcon } from 'lucide-react';
import { FeedPost } from './FeedPost';
import { PostSkeleton } from './PostSkeleton';
import { CommunityCard, EmptyState } from '../../ui';
import { useTranslation } from '@/hooks/useTranslation';
import type { Post } from '@repo/types';

interface FeedEmptyState {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: ReactNode;
}

interface FeedProps {
  posts: Post[];
  isLoading?: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onLikeToggle?: (postId: string, nextLiked: boolean) => void;
  onPostUpdated?: (post: Post) => void;
  onPostDeleted?: (postId: string) => void;
  emptyState?: FeedEmptyState;
  showEndMessage?: boolean;
  highlightedPostId?: string | null;
}

const DEFAULT_EMPTY_KEYS = {
  titleKey: 'community.emptyTitle',
  descriptionKey: 'community.emptyDesc',
} as const;

export function Feed({
  posts,
  isLoading = false,
  isLoadingMore = false,
  hasMore = false,
  onLoadMore,
  onLikeToggle,
  onPostUpdated,
  onPostDeleted,
  emptyState,
  showEndMessage = true,
  highlightedPostId = null,
}: FeedProps) {
  const { t } = useTranslation();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const empty = emptyState ?? {
    icon: Users,
    title: t(DEFAULT_EMPTY_KEYS.titleKey),
    description: t(DEFAULT_EMPTY_KEYS.descriptionKey),
  };
  const EmptyIcon = empty.icon ?? FileText;

  useEffect(() => {
    if (!hasMore || isLoading || isLoadingMore || !onLoadMore) return;

    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore();
      },
      { rootMargin: '200px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingMore, onLoadMore]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <CommunityCard>
        <EmptyState
          icon={EmptyIcon}
          title={empty.title}
          description={empty.description}
          action={empty.action}
        />
      </CommunityCard>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <FeedPost
          key={post.id}
          post={post}
          highlighted={highlightedPostId === post.id}
          onLikeToggle={onLikeToggle}
          onPostUpdated={onPostUpdated}
          onPostDeleted={onPostDeleted}
        />
      ))}

      <div ref={sentinelRef} className="h-4" />

      {isLoadingMore && (
        <div className="flex justify-center py-4">
          <Loader2 className="animate-spin text-[#B85C38]" size={28} />
        </div>
      )}

      {showEndMessage && !hasMore && posts.length > 0 && (
        <p className="text-center text-sm text-[#4A5568] py-4">{t('community.caughtUp')}</p>
      )}
    </div>
  );
}
