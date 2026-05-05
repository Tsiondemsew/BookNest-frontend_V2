import type {
  WishlistResponse,
  AddToWishlistRequest,
  AddToWishlistResponse,
  RemoveFromWishlistResponse,
  IsInWishlistResponse,
} from '@repo/types';
import { ApiClient } from './client';
import { endpoints } from './endpoints';

export function createWishlistApi(client: ApiClient) {
  return {
    getWishlist: (page?: number, limit?: number) => {
      const params = new URLSearchParams();
      if (page) params.append('page', String(page));
      if (limit) params.append('limit', String(limit));
      const url = params.toString() 
        ? `${endpoints.wishlist.list}?${params.toString()}`
        : endpoints.wishlist.list;
      return client.get<WishlistResponse>(url);
    },

    addToWishlist: (bookId: string) =>
      client.post<AddToWishlistResponse, AddToWishlistRequest>(
        endpoints.wishlist.add,
        { book_id: bookId }
      ),

    removeFromWishlist: (bookId: string) =>
      client.delete<RemoveFromWishlistResponse>(endpoints.wishlist.remove(bookId)),

    isInWishlist: (bookId: string) =>
      client.get<IsInWishlistResponse>(endpoints.wishlist.check(bookId)),

    getWishlistCount: () =>
      client.get<{ success: boolean; data: { count: number } }>(endpoints.wishlist.count),
  };
}