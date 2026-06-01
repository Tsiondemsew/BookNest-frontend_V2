'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Feed, CommunityUserSearch } from '@/features/community';
import { ui } from '@/features/community/ui';
import { feedApi } from '@/lib/api/client';
import type { Post } from '@repo/types';

const PAGE_SIZE = 10;

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = useCallback(async (pageNum: number, append = false) => {
    if (append) setIsLoadingMore(true);
    else setIsLoading(true);

    try {
      const response = await feedApi.getFeed(pageNum, PAGE_SIZE);
      const { posts: newPosts, totalPages: pages } = response.data;
      setPosts((prev) => (append ? [...prev, ...newPosts] : newPosts));
      setTotalPages(pages);
      setPage(pageNum);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load feed';
      setError(message);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    void fetchFeed(1);
  }, [fetchFeed]);

  const handleLikeToggle = async (postId: string, nextLiked: boolean) => {
    try {
      if (nextLiked) {
        await feedApi.likePost(postId);
      } else {
        await feedApi.unlikePost(postId);
      }
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                isLiked: nextLiked,
                likeCount: nextLiked ? post.likeCount + 1 : Math.max(0, post.likeCount - 1),
              }
            : post
        )
      );
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const handleLoadMore = () => {
    if (isLoadingMore || page >= totalPages) return;
    void fetchFeed(page + 1, true);
  };

  const handlePostUpdated = (updated: Post) => {
    setPosts((prev) => prev.map((post) => (post.id === updated.id ? updated : post)));
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  if (error && posts.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
          {error}
          <button type="button" onClick={() => void fetchFeed(1)} className="ml-4 underline">
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl lg:max-w-7xl mx-auto relative">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Feed
            posts={posts}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            hasMore={page < totalPages}
            onLoadMore={handleLoadMore}
            onLikeToggle={handleLikeToggle}
            onPostUpdated={handlePostUpdated}
            onPostDeleted={handlePostDeleted}
            emptyState={{
              title: 'No posts yet',
              description: 'Be the first to share something with the community.',
              action: (
                <Link href="/community/post" className={ui.btnPrimary}>
                  <Plus size={16} />
                  Write a post
                </Link>
              ),
            }}
          />
        </div>

        <aside className="hidden lg:block space-y-4 lg:sticky lg:top-6 lg:self-start">
          <CommunityUserSearch />
        </aside>
      </div>

      <Link
        href="/community/post"
        className="fixed z-50 bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))] right-4 lg:bottom-8 lg:right-8 w-14 h-14 rounded-full bg-[#B85C38] text-white shadow-lg shadow-[#B85C38]/35 flex items-center justify-center hover:bg-[#A04E2F] active:scale-95 transition-all"
        aria-label="New post"
      >
        <Plus size={26} strokeWidth={2.5} />
      </Link>
    </div>
  );
}
