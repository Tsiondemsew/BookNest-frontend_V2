'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Check, Loader2, CreditCard } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuthStore } from '@/stores/authStore';

interface AddToCartButtonProps {
  bookFormatId: string;
  formatType: 'PDF' | 'Audio';
  price: number;
  variant?: 'primary' | 'outline' | 'small' | 'buy-now';
}

export function AddToCartButton({ 
  bookFormatId, 
  formatType, 
  price, 
  variant = 'primary' 
}: AddToCartButtonProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { addToCart, isLoading } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    router.push(`/checkout?book_format_id=${bookFormatId}`);
  };
  
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    try {
      await addToCart(bookFormatId);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  if (variant === 'buy-now') {
    return (
      <button
        onClick={handleBuyNow}
        className="flex items-center gap-2 rounded-lg bg-[#B85C38] text-white px-5 py-2 text-sm font-medium hover:bg-[#8E735B] transition-colors shadow-sm"
      >
        <CreditCard size={16} />
        Buy Now
      </button>
    );
  }

  if (isAdded) {
    return (
      <button className="flex items-center gap-2 rounded-lg bg-[#2D6A4F] text-white px-5 py-2 text-sm font-medium" disabled>
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
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#2C3E50] text-white py-2 text-sm font-medium hover:bg-[#1A2A3A] transition-colors disabled:opacity-50"
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
        className="flex items-center gap-2 rounded-lg bg-[#2C3E50] text-white px-6 py-2 text-sm font-medium hover:bg-[#1A2A3A] transition-colors shadow-sm disabled:opacity-50"
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
      className="flex items-center gap-2 rounded-lg border border-[#2C3E50] text-[#2C3E50] px-6 py-2 text-sm font-medium hover:bg-[#2C3E50]/5 transition-colors disabled:opacity-50"
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