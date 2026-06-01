'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Plus, Loader2 } from 'lucide-react';
import { Feed, CommunityUserSearch } from '@/features/community';
import { ui } from '@/features/community/ui';
import { feedApi } from '@/lib/api/client';
import type { Post } from '@repo/types';
import { useTranslation } from '@/hooks/useTranslation';
import { dismissPostNotifications } from '@/lib/notifications/dismissOnView';

const PAGE_SIZE = 10;

function mergePinnedPost(feedPosts: Post[], pinned: Post | null): Post[] {
  if (!pinned) return feedPosts;
  const rest = feedPosts.filter((p) => p.id !== pinned.id);
  return [pinned, ...rest];
}

function CommunityPageContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const pinnedPostId = searchParams.get('post');

  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pinnedPost, setPinnedPost] = useState<Post | null>(null);

  const fetchPinnedPost = useCallback(async (postId: string) => {
    try {
      const response = await feedApi.getPost(postId);
      const post = response.data;
      setPinnedPost(post);
      setPosts((prev) => mergePinnedPost(prev, post));
      return post;
    } catch {
      return null;
    }
  }, []);

  const fetchFeed = useCallback(
    async (pageNum: number, append = false) => {
      if (append) setIsLoadingMore(true);
      else setIsLoading(true);

      try {
        const [feedResponse, pinned] = await Promise.all([
          feedApi.getFeed(pageNum, PAGE_SIZE),
          !append && pinnedPostId ? feedApi.getPost(pinnedPostId).catch(() => null) : Promise.resolve(null),
        ]);

        const { posts: newPosts, totalPages: pages } = feedResponse.data;
        const pinnedData = pinned?.data ?? null;

        if (pinnedData) {
          setPinnedPost(pinnedData);
        }

        setPosts((prev) => {
          const merged = append ? [...prev, ...newPosts] : mergePinnedPost(newPosts, pinnedData);
          if (pinnedData && append) {
            return mergePinnedPost(merged, pinnedData);
          }
          return merged;
        });
        setTotalPages(pages);
        setPage(pageNum);
        setError(null);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : t('community.feedError');
        setError(message);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [pinnedPostId, t]
  );

  useEffect(() => {
    void fetchFeed(1);
  }, [fetchFeed]);

  useEffect(() => {
    if (!pinnedPostId || pinnedPost?.id === pinnedPostId) return;
    void fetchPinnedPost(pinnedPostId);
  }, [pinnedPostId, pinnedPost?.id, fetchPinnedPost]);

  useEffect(() => {
    if (!pinnedPostId || isLoading) return;
    const timer = window.setTimeout(() => {
      document.getElementById(`post-${pinnedPostId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      dismissPostNotifications(pinnedPostId);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [pinnedPostId, isLoading]);

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
    if (pinnedPost?.id === updated.id) setPinnedPost(updated);
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
    if (pinnedPost?.id === postId) setPinnedPost(null);
  };

  if (error && posts.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
          {error}
          <button type="button" onClick={() => void fetchFeed(1)} className="ml-4 underline">
            {t('common.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl lg:max-w-7xl mx-auto relative">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {pinnedPost && (
            <p className="text-xs font-medium text-[#B85C38] mb-2 px-1">{t('community.sharedPost')}</p>
          )}
          <Feed
              posts={posts}
              isLoading={isLoading}
              isLoadingMore={isLoadingMore}
              hasMore={page < totalPages}
              onLoadMore={handleLoadMore}
              onLikeToggle={handleLikeToggle}
              onPostUpdated={handlePostUpdated}
              onPostDeleted={handlePostDeleted}
              highlightedPostId={pinnedPostId}
              emptyState={{
                title: t('community.emptyTitle'),
                description: t('community.emptyDesc'),
                action: (
                  <Link href="/community/post" className={ui.btnPrimary}>
                    <Plus size={16} />
                    {t('community.writePost')}
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
        aria-label={t('community.newPost')}
      >
        <Plus size={26} strokeWidth={2.5} />
      </Link>
    </div>
  );
}

export default function CommunityPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <Loader2 size={32} className="animate-spin text-[#B85C38]" />
        </div>
      }
    >
      <CommunityPageContent />
    </Suspense>
  );
}
