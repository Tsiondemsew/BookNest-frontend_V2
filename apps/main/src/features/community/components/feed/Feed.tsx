'use client';

import { FeedPost } from './FeedPost';
import { PostSkeleton } from './PostSkeleton';
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
      <div className="bg-white rounded-xl border border-[#E8E2D9] p-8 text-center">
        <p className="text-[#4A5568]">No posts yet. Follow authors and publishers to see their updates!</p>
      </div>
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