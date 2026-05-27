'use client';

import { Heart } from 'lucide-react';
import { useIsInWishlist, useToggleWishlist } from '../hooks/useWishlist';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface WishlistButtonProps {
  bookId: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function WishlistButton({ 
  bookId, 
  size = 'md', 
  showText = false,
  className = ''
}: WishlistButtonProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { data: isInWishlist, isLoading: isChecking } = useIsInWishlist(bookId);
  const { toggleWishlist, isPending } = useToggleWishlist();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push(`/login?redirect=/market/${bookId}`);
      return;
    }

    if (!isChecking && !isPending) {
      await toggleWishlist(bookId, isInWishlist || false);
      {isInWishlist ? toast.success('Book removed from wishlist!'): toast.success('Book added to wishlist!')}
    }
  };

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
  };

  const iconSizes = {
    sm: 16,
    md: 18,
    lg: 22,
  };

  const isActive = isInWishlist;
  const isLoading = isChecking || isPending;

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`
        flex items-center gap-2 rounded-full transition-all duration-200
        ${sizeClasses[size]}
        ${isActive 
          ? 'bg-red-50 text-red-500 hover:bg-red-100' 
          : 'bg-white text-[#4A5568] hover:bg-[#F5F1EB] border border-[#E8E2D9]'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      aria-label={isActive ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart 
        size={iconSizes[size]} 
        fill={isActive ? 'currentColor' : 'none'}
        className="transition-transform hover:scale-110"
      />
      {showText && (
        <span className="text-sm font-medium">
          {isActive ? 'Saved' : 'Save to Wishlist'}
        </span>
      )}
    </button>
  );
}