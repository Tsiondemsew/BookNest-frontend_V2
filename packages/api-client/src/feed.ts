import type {
  FeedResponse,
  CreatePostRequest,
  CreatePostResponse,
  UserPostsResponse ,
  Post,
} from '@repo/types';
import { ApiClient } from './client';
import { endpoints } from './endpoints';

export function createFeedApi(client: ApiClient) {
  return {
    // Get feed posts
    getFeed: (page?: number, limit?: number) => {
      const params = new URLSearchParams();
      if (page) params.append('page', String(page));
      if (limit) params.append('limit', String(limit));
      const url = params.toString() 
        ? `${endpoints.feed.list}?${params.toString()}`
        : endpoints.feed.list;
      return client.get<FeedResponse>(url);
    },

    
    // Create a post
    createPost: (data: CreatePostRequest) =>
      client.post<CreatePostResponse, CreatePostRequest>(endpoints.feed.posts, data),

    // Like a post
    likePost: (postId: string) =>
      client.post<{ success: boolean }>(`${endpoints.feed.like(postId)}`, {}),

    // Unlike a post
    unlikePost: (postId: string) =>
      client.delete<{ success: boolean }>(endpoints.feed.like(postId)),

    // Save draft
    saveDraft: (data: CreatePostRequest) =>
      client.post<CreatePostResponse, CreatePostRequest>(endpoints.feed.drafts, data),

    // Publish draft
    publishDraft: (postId: string) =>
      client.post<{ success: boolean; data: Post }>(endpoints.feed.publish(postId), {}),

    // Delete post
    deletePost: (postId: string) =>
      client.delete<{ success: boolean }>(endpoints.feed.postDetail(postId)),

    // Get my posts
    getMyPosts: (includeDrafts?: boolean, page?: number, limit?: number) => {
      const params = new URLSearchParams();
      if (includeDrafts) params.append('include_drafts', 'true');
      if (page) params.append('page', String(page));
      if (limit) params.append('limit', String(limit));
      const url = params.toString() 
        ? `${endpoints.feed.myPosts}?${params.toString()}`
        : endpoints.feed.myPosts;
      return client.get<FeedResponse>(url);
    },
     getUserPosts: (userId: string, page?: number, limit?: number) => {
  const params = new URLSearchParams();
  if (page) params.append('page', String(page));
  if (limit) params.append('limit', String(limit));
  const url = params.toString()
    ? `${endpoints.feed.userPosts(userId)}?${params.toString()}`
    : endpoints.feed.userPosts(userId);
  return client.get<UserPostsResponse>(url);
},
   
  };

  
}