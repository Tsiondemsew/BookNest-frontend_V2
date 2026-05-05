import { ApiClient, createAuthApi, createBooksApi , createWishlistApi, createAnalyticsApi, createSellerApi} from '@repo/api-client';
import { apiConfig } from './config';

export const apiClient = new ApiClient(apiConfig);
export const authApi = createAuthApi(apiClient);
export const booksApi = createBooksApi(apiClient);
export const wishlistApi = createWishlistApi(apiClient);
export const analyticsApi = createAnalyticsApi(apiClient);
export const sellerApi = createSellerApi(apiClient);


// Re-export types for convenience
export type { GetBooksParams, 
  CreateBookRequest, 
  UpdateBookRequest,
  MyBooksResponse, } from '@repo/api-client';
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