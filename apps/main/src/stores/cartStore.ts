'use client';

import { create } from 'zustand';
import { createCartApi } from '@repo/api-client';
import { apiClient } from '@/lib/api/client';
import type { Cart, CartItem } from '@repo/types';

const cartApi = createCartApi(apiClient);

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  itemCount: number;
  
  fetchCart: () => Promise<void>;
  addToCart: (bookFormatId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isLoading: false,
  error: null,
  itemCount: 0,

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await cartApi.getCart();
      const cart = response.data;
      // ✅ Each item is one book format (no quantity field, just count items)
      const itemCount = cart.items?.length || 0; 
      set({ cart, itemCount, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to load cart', isLoading: false });
    }
  },

  addToCart: async (bookFormatId: string, quantity = 1) => {
    set({ isLoading: true, error: null });
    try {
      const response = await cartApi.addToCart(bookFormatId, quantity);
      const cart = response.data;
      // ✅ Count items (each is one book format)
      const itemCount = cart.items?.length || 0;
      set({ cart, itemCount, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to add to cart', isLoading: false });
      throw error;
    }
  },

  updateQuantity: async (itemId: string, quantity: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await cartApi.updateItem(itemId, quantity);
      const cart = response.data;
      // ✅ Since no quantity, itemCount is just number of items
      const itemCount = cart.items?.length || 0;
      set({ cart, itemCount, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to update cart', isLoading: false });
    }
  },

  removeItem: async (itemId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await cartApi.removeItem(itemId);
      const cart = response.data;
      const itemCount = cart.items?.length || 0;
      set({ cart, itemCount, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to remove item', isLoading: false });
    }
  },

  clearCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await cartApi.clearCart();
      const cart = response.data;
      set({ cart, itemCount: 0, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to clear cart', isLoading: false });
    }
  },
}));