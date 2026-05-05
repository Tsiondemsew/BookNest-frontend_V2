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
    await addToCart(bookFormatId);  // Remove the quantity parameter
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
        className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
      >
        <CreditCard size={16} />
        Buy Now
      </button>
    );
  }

  if (isAdded) {
    return (
      <button className="flex items-center gap-2 rounded-md bg-green-600 text-white px-6 py-2" disabled>
        <Check size={16} />
        Added to Cart!
      </button>
    );
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={isLoading}
      className={`flex items-center gap-2 rounded-md transition-colors ${
        variant === 'primary' 
          ? 'bg-blue-600 text-white hover:bg-blue-700 px-6 py-2'
          : variant === 'outline'
          ? 'border border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-2'
          : 'bg-blue-600 text-white hover:bg-blue-700 px-3 py-1 text-sm'
      } disabled:opacity-50`}
    >
      {isLoading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <ShoppingCart size={16} />
      )}
      {variant !== 'small' && `${price} ETB - Add to Cart`}
      {variant === 'small' && 'Add'}
    </button>
  );
}