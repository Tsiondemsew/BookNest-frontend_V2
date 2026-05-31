'use client';

import { useState } from 'react';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { followApi } from '@/lib/api/client';

interface FollowButtonProps {
  userId: string;
  initialIsFollowing?: boolean;
  initialFollowerCount?: number;
  size?: 'sm' | 'md';
  compact?: boolean;
  onFollowChange?: (isFollowing: boolean, followerCount: number) => void;
}

export function FollowButton({
  userId,
  initialIsFollowing = false,
  initialFollowerCount = 0,
  size = 'md',
  compact = false,
  onFollowChange,
}: FollowButtonProps) {
  const { isAuthenticated } = useAuthStore();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [isPending, setIsPending] = useState(false);

  const sizes = {
    sm: { px: compact ? 'px-2.5' : 'px-3', py: compact ? 'py-1' : 'py-1', text: 'text-xs', icon: 14 },
    md: { px: 'px-4', py: 'py-1.5', text: 'text-sm', icon: 16 },
  };

  const handleFollow = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }

    setIsPending(true);
    const nextFollowing = !isFollowing;
    const nextCount = nextFollowing ? followerCount + 1 : Math.max(0, followerCount - 1);

    setIsFollowing(nextFollowing);
    setFollowerCount(nextCount);

    try {
      if (nextFollowing) {
        await followApi.follow(userId);
      } else {
        await followApi.unfollow(userId);
      }
      onFollowChange?.(nextFollowing, nextCount);
    } catch {
      setIsFollowing(isFollowing);
      setFollowerCount(followerCount);
    } finally {
      setIsPending(false);
    }
  };

  const btnSize = compact ? 'sm' : size;

  return (
    <button
      type="button"
      onClick={() => void handleFollow()}
      disabled={isPending}
      className={`flex items-center gap-1.5 rounded-full font-medium transition-colors ${
        isFollowing
          ? `border border-[#E8E2D9] text-[#4A5568] hover:bg-red-50 hover:text-red-500 hover:border-red-200 ${sizes[btnSize].px} ${sizes[btnSize].py}`
          : `bg-[#B85C38] text-white hover:bg-[#8E735B] ${sizes[btnSize].px} ${sizes[btnSize].py}`
      } ${sizes[btnSize].text}`}
    >
      {isPending ? (
        <Loader2 size={sizes[btnSize].icon} className="animate-spin" />
      ) : isFollowing ? (
        <UserCheck size={sizes[btnSize].icon} />
      ) : (
        <UserPlus size={sizes[btnSize].icon} />
      )}
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  );
}
