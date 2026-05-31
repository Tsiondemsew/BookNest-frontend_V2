'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { feedApi } from '@/lib/api/client';
import { cn, ui } from '../../ui';

interface LikeButtonProps {
  targetId: string;
  targetType?: 'post' | 'comment';
  initialLiked: boolean;
  initialCount: number;
  size?: 'sm' | 'md' | 'xs';
}

export function LikeButton({
  targetId,
  targetType = 'post',
  initialLiked,
  initialCount,
  size = 'md',
}: LikeButtonProps) {
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
    setLikeCount((prev) => Math.max(0, prev + (next ? 1 : -1)));

    try {
      if (targetType === 'comment') {
        if (next) await feedApi.likeComment(targetId);
        else await feedApi.unlikeComment(targetId);
      } else {
        if (next) await feedApi.likePost(targetId);
        else await feedApi.unlikePost(targetId);
      }
    } catch {
      setIsLiked(!next);
      setLikeCount((prev) => Math.max(0, prev + (next ? -1 : 1)));
    } finally {
      setIsPending(false);
    }
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
