'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';

export function useCart() {
  const { isAuthenticated } = useAuthStore();
  const { cart, isLoading, itemCount, fetchCart, addToCart, updateQuantity, removeItem, clearCart } = useCartStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

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