'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useWishlistCount } from '@/features/wishlist/hooks/useWishlist';

export function useCommerceCounts() {
  const { isAuthenticated } = useAuthStore();
  const cartCount = useCartStore((s) => s.itemCount);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const { data: wishlistCount = 0 } = useWishlistCount();

  useEffect(() => {
    if (isAuthenticated) {
      void fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  return {
    cartCount,
    wishlistCount,
    marketBadgeCount: cartCount + wishlistCount,
  };
}
