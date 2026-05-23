import { createFeedApi } from '@repo/api-client';
import { apiClient } from './client';

export const feedApi = createFeedApi(apiClient);

// Re-export types for convenience
export type { Post, FeedResponse, CreatePostRequest } from '@repo/types';