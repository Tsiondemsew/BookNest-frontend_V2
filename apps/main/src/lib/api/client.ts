import {
  ApiClient,
  UnauthorizedError,
  createAuthApi,
  createBooksApi,
  createWishlistApi,
  createAnalyticsApi,
  createSellerApi,
  createProfileApi,
  createFeedApi,
  createChatApi,
  createCartApi,
  createCheckoutApi,
  createProgressApi,
  createUsersApi,
} from '@repo/api-client';
import { apiConfig } from './config';  
import { useAuthStore } from '@/stores/authStore';

export const apiClient = new ApiClient(apiConfig);

// Global 401 handling: if the cookie token expired, gracefully log out and
// tell the app to redirect to /login.
const _request = apiClient.request.bind(apiClient);
apiClient.request = async (...args: Parameters<typeof _request>) => {
  try {
    return await _request(...args);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      try {
        await useAuthStore.getState().logout();
      } catch {
        // ignore
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }
    throw error;
  }
};

export const authApi = createAuthApi(apiClient);
export const booksApi = createBooksApi(apiClient);
export const wishlistApi = createWishlistApi(apiClient);
export const analyticsApi = createAnalyticsApi(apiClient);
export const sellerApi = createSellerApi(apiClient);
export const profileApi = createProfileApi(apiClient);
export const feedApi = createFeedApi(apiClient);
export const chatApi = createChatApi(apiClient);
export const cartApi = createCartApi(apiClient);
export const checkoutApi = createCheckoutApi(apiClient);
export const progressApi = createProgressApi(apiClient);
export const usersApi = createUsersApi(apiClient);

// Re-export types for convenience

export type { Chat, ChatMessage, ChatResponse, ChatMessagesResponse } from '@repo/types';
export type { Post, FeedResponse, CreatePostRequest } from '@repo/types';
export type { GetBooksParams, 
  CreateBookRequest, 
  UpdateBookRequest,
  MyBooksResponse,

} from '@repo/api-client';
export type {
  Book,
  BooksResponse,
  BookResponse,
  GenresResponse,
  WishlistItem,
  WishlistResponse,
  AnalyticsResponse,
  SellerProfileResponse,
} from '@repo/types';