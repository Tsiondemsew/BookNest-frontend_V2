'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingCart, Check, Loader2, CreditCard } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuthStore } from '@/stores/authStore';
import { buildLoginUrl } from '@/lib/auth/pendingAuthAction';

interface AddToCartButtonProps {
  bookFormatId: string;
  bookId?: string;
  formatType: 'PDF' | 'Audio';
  price: number;
  variant?: 'primary' | 'outline' | 'small' | 'buy-now';
  isOwned?: boolean;
  isOwnBook?: boolean;
}

export function AddToCartButton({
  bookFormatId,
  bookId,
  formatType,
  price,
  variant = 'primary',
  isOwned = false,
  isOwnBook = false,
}: AddToCartButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  const { addToCart, isLoading } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const redirectPath = bookId ? `/market/${bookId}` : pathname || '/market';

  const requireAuth = (action: 'add-to-cart' | 'buy') => {
    if (isAuthenticated) return true;
    router.push(
      buildLoginUrl({
        redirect: redirectPath,
        action,
        bookFormatIds: [bookFormatId],
      })
    );
    return false;
  };

  const handleBuyNow = () => {
    if (isOwnBook || isOwned) return;
    if (!requireAuth('buy')) return;
    router.push(`/checkout?book_format_id=${bookFormatId}`);
  };

  const handleAddToCart = async () => {
    if (isOwnBook || isOwned) return;
    if (!requireAuth('add-to-cart')) return;

    try {
      await addToCart(bookFormatId);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  if (isOwnBook) {
    return (
      <span className="block w-full rounded-lg bg-[#F5F1EB] py-2 text-center text-xs font-medium text-[#4A5568]">
        Your book
      </span>
    );
  }

  if (isOwned) {
    return (
      <span className="block w-full rounded-lg bg-[#F0FDF4] py-2 text-center text-xs font-medium text-[#2D6A4F]">
        Owned
      </span>
    );
  }

  if (variant === 'buy-now') {
    return (
      <button
        onClick={handleBuyNow}
        className="flex items-center gap-2 rounded-lg bg-[#B85C38] px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#8E735B]"
      >
        <CreditCard size={16} />
        Buy Now
      </button>
    );
  }

  if (isAdded) {
    return (
      <button
        className="flex items-center gap-2 rounded-lg bg-[#2D6A4F] px-5 py-2 text-sm font-medium text-white"
        disabled
      >
        <Check size={16} />
        Added to Cart!
      </button>
    );
  }

  if (variant === 'small') {
    return (
      <button
        onClick={handleAddToCart}
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2C3E50] py-2 text-sm font-medium text-white transition-colors hover:bg-[#1A2A3A] disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <ShoppingCart size={14} />
        )}
        {price} ETB
      </button>
    );
  }

  if (variant === 'primary') {
    return (
      <button
        onClick={handleAddToCart}
        disabled={isLoading}
        className="flex items-center gap-2 rounded-lg bg-[#2C3E50] px-6 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#1A2A3A] disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <ShoppingCart size={16} />
        )}
        {price} ETB - Add to Cart
      </button>
    );
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={isLoading}
      className="flex items-center gap-2 rounded-lg border border-[#2C3E50] px-6 py-2 text-sm font-medium text-[#2C3E50] transition-colors hover:bg-[#2C3E50]/5 disabled:opacity-50"
    >
      {isLoading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <ShoppingCart size={16} />
      )}
      {price} ETB - Add to Cart
    </button>
  );
}
