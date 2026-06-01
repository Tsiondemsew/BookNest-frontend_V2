'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { ProfileHeader, Feed } from '@/features/community';
import { BackLink } from '@/features/community/ui';
import { profileApi, feedApi } from '@/lib/api/client';
import { profileBackFallback } from '@/lib/community/profilePaths';
import { useAuthStore } from '@/stores/authStore';
import { Loader2, FileText } from 'lucide-react';
import type { PublicProfile, Post } from '@repo/types';

function PublicProfileContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const rawUsername = params.username as string;
  const username = decodeURIComponent(rawUsername?.replace(/^@/, '') || '')
    .trim()
    .toLowerCase();

  const backHref = searchParams.get('from') || profileBackFallback(username === 'me');

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsPrivate, setPostsPrivate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) return;
      setIsLoading(true);
      try {
        const profileResponse = await profileApi.getPublicProfile(username);
        const p = profileResponse.data;
        setProfile(p);

        const canSeePosts = p.isOwnProfile || !p.isPrivate || p.isFollowing;
        if (canSeePosts) {
          try {
            const postsResponse = await feedApi.getUserPosts(p.id);
            setPosts(postsResponse.data.posts);
            setPostsPrivate(false);
          } catch {
            setPosts([]);
            setPostsPrivate(true);
          }
        } else {
          setPosts([]);
          setPostsPrivate(true);
        }
      } catch {
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchProfile();
  }, [username, user?.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-[#B85C38]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <BackLink href={backHref} label="Back" className="mb-6" />
        <h1 className="text-2xl font-bold text-[#1A2A3A] mb-2">Profile not found</h1>
        <p className="text-[#4A5568]">The user you are looking for does not exist.</p>
        <button
          type="button"
          onClick={() => router.push(backHref)}
          className="inline-block mt-4 text-[#B85C38] hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  const canSeePosts = profile.isOwnProfile || !profile.isPrivate || profile.isFollowing;

  const postsEmptyState = profile.isOwnProfile
    ? {
        icon: FileText,
        title: 'You have no posts yet',
        description: 'Head to the community feed to share your first post with followers.',
      }
    : {
        icon: FileText,
        title: `No posts from ${profile.name} yet`,
        description: 'This user has not published any posts. Check back later.',
      };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <BackLink href={backHref} label="Back" />

      <ProfileHeader
        profile={{
          id: profile.id,
          name: profile.name,
          username: profile.username,
          role: profile.role,
          bio: profile.bio,
          avatarUrl: profile.avatarUrl,
          coverUrl: null,
          location: profile.location,
          website: profile.website,
          joinedAt: profile.joinedAt,
          followerCount: profile.followerCount ?? 0,
          followingCount: profile.followingCount ?? 0,
          postCount: profile.postCount ?? 0,
          isFollowing: profile.isFollowing,
          isOwnProfile: profile.isOwnProfile ?? profile.id === user?.id,
          isPrivate: profile.isPrivate,
          readingStats: profile.readingStats,
          achievements: profile.achievements,
        }}
        onEdit={() => router.push('/profile')}
        onSettings={() => router.push('/profile')}
      />

      {profile.email && (
        <p className="text-sm text-[#4A5568] px-1">
          Contact: <span className="text-[#1A2A3A]">{profile.email}</span>
        </p>
      )}

      {!canSeePosts || postsPrivate ? (
        <div className="text-center py-12 rounded-2xl border border-[#E8E2D9] bg-white">
          <p className="text-[#1A2A3A] font-medium">Posts are private</p>
          <p className="text-sm text-[#4A5568] mt-1">
            {profile.isPrivate && !profile.isFollowing
              ? 'Follow this account to see their posts.'
              : 'This user has not shared posts yet.'}
          </p>
        </div>
      ) : (
        <Feed
          posts={posts}
          emptyState={postsEmptyState}
          showEndMessage={false}
          onPostUpdated={(updated) =>
            setPosts((prev) => prev.map((post) => (post.id === updated.id ? updated : post)))
          }
          onPostDeleted={(postId) => setPosts((prev) => prev.filter((post) => post.id !== postId))}
        />
      )}
    </div>
  );
}

export default function PublicProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin text-[#B85C38]" />
        </div>
      }
    >
      <PublicProfileContent />
    </Suspense>
  );
}
