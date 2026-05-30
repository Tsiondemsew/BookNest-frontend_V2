'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { cn, ui } from '../../ui';

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

  const iconSize = size === 'xs' ? 12 : size === 'sm' ? 16 : 18;

  const handleLike = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }

    setIsPending(true);
    const next = !isLiked;
    setIsLiked(next);
    setLikeCount((prev) => prev + (next ? 1 : -1));
    await new Promise((resolve) => setTimeout(resolve, 300));
    setIsPending(false);
    void postId;
  };

  return (
    <button
      type="button"
      onClick={() => void handleLike()}
      disabled={isPending}
      className={cn(
        ui.actionChip,
        size === 'xs' && '!text-xs !px-1',
        isLiked && ui.actionChipActive
      )}
    >
      <Heart size={iconSize} fill={isLiked ? 'currentColor' : 'none'} />
      <span>{likeCount > 0 ? likeCount : size === 'xs' ? '' : 'Like'}</span>
    </button>
  );
}
