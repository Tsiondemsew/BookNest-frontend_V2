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
  createLibraryApi,
  createDownloadApi,
  createReviewsApi,
  createSellerFinanceApi,
  createGamificationApi,
  createNotificationsApi,
  createFollowApi,
} from '@repo/api-client';
import { apiConfig } from './config';
import { useAuthStore } from '@/stores/authStore';
import { isPublicAppPath } from '@/lib/auth/publicRoutes';

export const apiClient = new ApiClient(apiConfig);

// Global 401 handling: if the cookie token expired, gracefully log out and
// tell the app to redirect to /login.
const _request = apiClient.request.bind(apiClient);
apiClient.request = async (...args: Parameters<typeof _request>) => {
  try {
    return await _request(...args);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      const path = typeof window !== 'undefined' ? window.location.pathname : '';
      const isMeCheck = typeof args[0] === 'string' && args[0].includes('/api/auth/me');
      const isCheckoutVerify =
        typeof args[0] === 'string' && args[0].includes('/api/checkout/verify');

      if (!isPublicAppPath(path) && !isMeCheck && !isCheckoutVerify && navigator.onLine) {
        try {
          await useAuthStore.getState().logout();
        } catch {
          // ignore
        }
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
export const libraryApi = createLibraryApi(apiClient);
export const downloadApi = createDownloadApi(apiConfig);
export const reviewsApi = createReviewsApi(apiClient);
export const sellerFinanceApi = createSellerFinanceApi(apiClient);
export const gamificationApi = createGamificationApi(apiClient);
export const notificationsApi = createNotificationsApi(apiClient);
export const followApi = createFollowApi(apiClient);

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