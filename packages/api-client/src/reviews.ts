import type {
  BookReviewsResponse,
  CanReviewResponse,
  CreateReviewRequest,
} from '@repo/types';
import { ApiClient } from './client';
import { endpoints } from './endpoints';

export function createReviewsApi(client: ApiClient) {
  return {
    listReviews: (bookId: string) =>
      client.get<BookReviewsResponse>(endpoints.reviews.list(bookId)),
    canReview: (bookId: string) =>
      client.get<CanReviewResponse>(endpoints.reviews.can(bookId)),
    createReview: (bookId: string, payload: CreateReviewRequest) =>
      client.post<{ success: boolean; data: unknown }, CreateReviewRequest>(
        endpoints.reviews.create(bookId),
        payload
      ),
  };
}
