import type {
  CartResponse,
  AddToCartRequest,
  UpdateCartItemRequest,
} from '@repo/types';
import { ApiClient } from './client';
import { endpoints } from './endpoints';

export function createCartApi(client: ApiClient) {
  return {
    getCart: () => client.get<CartResponse>(endpoints.cart.get),

    addToCart: (bookFormatId: string, quantity?: number) =>
      client.post<CartResponse, AddToCartRequest>(endpoints.cart.addItem, {
        book_format_id: bookFormatId,
        // quantity is not needed for your cart (no quantity field)
      }),

    updateItem: (itemId: string, quantity: number) =>
      client.put<CartResponse, UpdateCartItemRequest>(
        endpoints.cart.updateItem(itemId),
        { quantity }
      ),

    removeItem: (itemId: string) =>
      client.delete<CartResponse>(endpoints.cart.removeItem(itemId)),

    clearCart: () => client.delete<CartResponse>(endpoints.cart.clear),
  };
}