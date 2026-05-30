export * from './client';
export * from './config';
export * from './endpoints';
export * from './errors';
export * from './parseApiError';
export * from './auth';
export * from './books';
export * from './wishlist';
export * from './analytics';
export * from './seller';
export * from './cart';
export * from './checkout';
export * from './chat';
export * from './feed';
export * from './profile';
export * from './progress';
export * from './library';
export * from './download';
export * from './reviews';
export * from './sellerFinance';
export * from './gamification';
export * from './notifications';
export * from './users';

export { createLibraryApi } from './library';
export { createDownloadApi } from './download';
export { createReviewsApi } from './reviews';
export { createSellerFinanceApi } from './sellerFinance';
export { createGamificationApi } from './gamification';
export { createNotificationsApi } from './notifications';
export { createProgressApi } from './progress';
export { createAnalyticsApi } from './analytics';

// Re-export types
export type {
  CreateBookRequest,
  UpdateBookRequest,
  DeleteBookResponse,
  MyBooksResponse,
  AnalyticsResponse,
  SellerProfileResponse,
  Cart,
  CartItem,
  CartResponse,
  AddToCartRequest,
  UpdateCartItemRequest,
  CheckoutRequest,
  CheckoutResponse,
  ChatResponse,
  ChatMessagesResponse,
} from '@repo/types';