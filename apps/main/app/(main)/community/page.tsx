'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { PenSquare } from 'lucide-react';
import { Feed, CommunityUserSearch } from '@/features/community';
import { PageHeader, ui } from '@/features/community/ui';
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

  if (error && posts.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
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
    <div className="max-w-7xl mx-auto px-4 py-6">
      <PageHeader
        backHref="/dashboard"
        backLabel="Back"
        title="Community feed"
        description="All public posts from the BookNest community — posts from people you follow are highlighted"
        action={
          <Link href="/community/post" className={ui.btnPrimary}>
            <PenSquare size={18} />
            New post
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Feed
            posts={posts}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            hasMore={page < totalPages}
            onLoadMore={handleLoadMore}
            onLikeToggle={handleLikeToggle}
            emptyState={{
              title: 'No posts yet',
              description: 'Be the first to share something with the community.',
              action: (
                <Link href="/community/post" className={ui.btnPrimary}>
                  <PenSquare size={16} />
                  Write a post
                </Link>
              ),
            }}
          />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <CommunityUserSearch />

          <div className="bg-white rounded-2xl border border-[#E8E2D9] p-4 shadow-sm">
            <h3 className="font-semibold text-[#1A2A3A] mb-3">Tips</h3>
            <ul className="space-y-2 text-sm text-[#4A5568]">
              <li>Every published post is visible to everyone</li>
              <li>Follow people you like — their posts show a Following badge</li>
              <li>Tag books from the market to recommend reads</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
