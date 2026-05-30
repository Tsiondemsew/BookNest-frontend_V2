'use client';

import { Users } from 'lucide-react';
import { FeedPost } from './FeedPost';
import { PostSkeleton } from './PostSkeleton';
import { CommunityCard, EmptyState, ui } from '../../ui';
import type { Post } from '@repo/types';

interface FeedProps {
  posts: Post[];
  isLoading?: boolean;
  onLikeToggle?: (postId: string, isLiked: boolean) => void;
}

export function Feed({ posts, isLoading = false, onLikeToggle }: FeedProps) {
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
          icon={Users}
          title="Your feed is quiet"
          description="Follow authors, publishers, and readers to see their posts here."
        />
      </CommunityCard>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <FeedPost key={post.id} post={post} onLikeToggle={onLikeToggle} />
      ))}
    </div>
  );
}
