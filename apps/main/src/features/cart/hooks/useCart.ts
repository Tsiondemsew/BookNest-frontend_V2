'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';

export function useCart() {
  const { isAuthenticated } = useAuthStore();
  const { cart, isLoading, itemCount, fetchCart, addToCart, updateQuantity, removeItem, clearCart } = useCartStore();

  useEffect(() => {
    if (isAuthenticated) {
      void useCartStore.getState().fetchCart();
    }
  }, [isAuthenticated]);

  return {
    cart,
    isLoading,
    itemCount,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
  };
}