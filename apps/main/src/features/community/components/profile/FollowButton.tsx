'use client';

import { useState } from 'react';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface FollowButtonProps {
  userId: string;
  initialIsFollowing: boolean;
  initialFollowerCount: number;
  size?: 'sm' | 'md';
}

export function FollowButton({ userId, initialIsFollowing, initialFollowerCount, size = 'md' }: FollowButtonProps) {
  const { isAuthenticated } = useAuthStore();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [isPending, setIsPending] = useState(false);

  const sizes = {
    sm: { px: 'px-3', py: 'py-1', text: 'text-sm', icon: 14 },
    md: { px: 'px-4', py: 'py-1.5', text: 'text-sm', icon: 16 },
  };

  const handleFollow = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }

    setIsPending(true);
    
    if (isFollowing) {
      setFollowerCount(prev => prev - 1);
      setIsFollowing(false);
    } else {
      setFollowerCount(prev => prev + 1);
      setIsFollowing(true);
    }

    // TODO: API call to follow/unfollow
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsPending(false);
  };

  return (
    <button
      onClick={handleFollow}
      disabled={isPending}
      className={`flex items-center gap-1.5 rounded-full font-medium transition-colors ${
        isFollowing
          ? `border border-[#E8E2D9] text-[#4A5568] hover:bg-red-50 hover:text-red-500 hover:border-red-200 ${sizes[size].px} ${sizes[size].py}`
          : `bg-[#B85C38] text-white hover:bg-[#8E735B] ${sizes[size].px} ${sizes[size].py}`
      } ${sizes[size].text}`}
    >
      {isPending ? (
        <Loader2 size={sizes[size].icon} className="animate-spin" />
      ) : isFollowing ? (
        <UserCheck size={sizes[size].icon} />
      ) : (
        <UserPlus size={sizes[size].icon} />
      )}
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  );
}