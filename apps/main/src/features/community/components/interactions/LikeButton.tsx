'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface LikeButtonProps {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
  size?: 'sm' | 'md' | 'xs';
}

export function LikeButton({ postId, initialLiked, initialCount, size = 'md' }: LikeButtonProps) {
  const { isAuthenticated } = useAuthStore();
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialCount);
  const [isPending, setIsPending] = useState(false);

  const sizes = {
    xs: { icon: 12, text: 'text-xs', gap: 'gap-0.5' },
    sm: { icon: 16, text: 'text-sm', gap: 'gap-1' },
    md: { icon: 18, text: 'text-sm', gap: 'gap-1' },
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }

    setIsPending(true);
    // Optimistic update
    if (isLiked) {
      setLikeCount(prev => prev - 1);
      setIsLiked(false);
    } else {
      setLikeCount(prev => prev + 1);
      setIsLiked(true);
    }

    // TODO: API call
    await new Promise(resolve => setTimeout(resolve, 300));
    setIsPending(false);
  };

  return (
    <button
      onClick={handleLike}
      disabled={isPending}
      className={`flex items-center ${sizes[size].gap} ${sizes[size].text} transition-colors ${
        isLiked ? 'text-red-500' : 'text-[#4A5568] hover:text-red-500'
      }`}
    >
      <Heart size={sizes[size].icon} fill={isLiked ? 'currentColor' : 'none'} />
      <span>{likeCount > 0 ? likeCount : ''}</span>
    </button>
  );
}