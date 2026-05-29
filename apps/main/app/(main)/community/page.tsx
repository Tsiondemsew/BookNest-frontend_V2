'use client';

import { useState, useEffect } from 'react';
import { Feed, CreatePost } from '@/features/community';
import { feedApi } from '@/lib/api/client';
import type { Post } from '@repo/types';

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = async () => {
    setIsLoading(true);
    try {
      const response = await feedApi.getFeed();
      setPosts(response.data.posts);
    } catch (err: any) {
      setError(err.message || 'Failed to load feed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handlePostCreated = (newPost: Post) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handleLikeToggle = async (postId: string, isLiked: boolean) => {
    try {
      if (isLiked) {
        await feedApi.unlikePost(postId);
      } else {
        await feedApi.likePost(postId);
      }
      setPosts(prev =>
        prev.map(post =>
          post.id === postId
            ? {
                ...post,
                isLiked: !isLiked,
                likeCount: isLiked ? post.likeCount - 1 : post.likeCount + 1,
              }
            : post
        )
      );
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
          <button onClick={fetchFeed} className="ml-4 underline">Try again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-[#1A2A3A] mb-6">Community Feed</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <CreatePost onPostCreated={handlePostCreated} />
          <Feed posts={posts} isLoading={isLoading} onLikeToggle={handleLikeToggle} />
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#E8E2D9] p-4">
            <h3 className="font-semibold text-[#1A2A3A] mb-3">Trending Topics</h3>
            <div className="space-y-2">
              <div className="text-sm"><span className="text-[#B85C38]">#BookRecommendations</span></div>
              <div className="text-sm"><span className="text-[#B85C38]">#ReadingStreak</span></div>
              <div className="text-sm"><span className="text-[#B85C38]">#NewRelease</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}