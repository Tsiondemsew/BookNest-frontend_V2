'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ProfileHeader } from '@/features/community';
import { Feed } from '@/features/community';
import { profileApi } from '@/lib/api/client';
import { feedApi } from '@/lib/api/client';
import { Loader2 } from 'lucide-react';
import type { PublicProfile, Post } from '@repo/types';

export default function PublicProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileResponse = await profileApi.getPublicProfile(username);
        setProfile(profileResponse.data);
        
        // Fetch user's posts
        const postsResponse = await feedApi.getUserPosts(profileResponse.data.id);
        setPosts(postsResponse.data.posts);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username]);

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
        <h1 className="text-2xl font-bold text-[#1A2A3A] mb-2">Profile Not Found</h1>
        <p className="text-[#4A5568]">The user you're looking for doesn't exist.</p>
      </div>
    );
  }

  if (profile.isPrivate && !profile.isFollowing) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4"></div>
        <h1 className="text-xl font-bold text-[#1A2A3A] mb-2">This account is private</h1>
        <p className="text-[#4A5568]">Follow to see their posts and stories.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <ProfileHeader 
        profile={{
          id: profile.id,
          name: profile.name,
          username: profile.username,
          bio: profile.bio,
          avatarUrl: profile.avatarUrl,
          coverUrl: null,
          location: profile.location,
          website: profile.website,
          joinedAt: profile.joinedAt,
          followerCount: profile.followerCount,
          followingCount: profile.followingCount,
          postCount: profile.postCount,
          isFollowing: profile.isFollowing,
          isOwnProfile: false,
          isPrivate: profile.isPrivate,
        }}
      />
      <Feed posts={posts} />
    </div>
  );
}