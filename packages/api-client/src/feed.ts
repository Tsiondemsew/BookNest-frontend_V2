import type {
  FeedResponse,
  CreatePostRequest,
  CreatePostResponse,
  UserPostsResponse,
  Post,
  CommentsResponse,
  Comment,
} from '@repo/types';
import { ApiClient } from './client';
import { endpoints } from './endpoints';

export function createFeedApi(client: ApiClient) {
  return {
    getFeed: (page?: number, limit?: number) => {
      const params = new URLSearchParams();
      if (page) params.append('page', String(page));
      if (limit) params.append('limit', String(limit));
      const url = params.toString()
        ? `${endpoints.feed.list}?${params.toString()}`
        : endpoints.feed.list;
      return client.get<FeedResponse>(url);
    },

    uploadPostImage: (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      return client.post<{ success: boolean; data: { image_url: string } }>(
        endpoints.feed.uploadImage,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
    },

    createPost: (data: CreatePostRequest) =>
      client.post<CreatePostResponse, CreatePostRequest>(endpoints.feed.posts, data),

    likePost: (postId: string) =>
      client.post<{ success: boolean }>(endpoints.feed.like(postId), {}),

    unlikePost: (postId: string) =>
      client.delete<{ success: boolean }>(endpoints.feed.like(postId)),

    sharePost: (postId: string) =>
      client.post<{ success: boolean; data: { shareCount: number } }>(
        endpoints.feed.share(postId),
        {}
      ),

    getPost: (postId: string) =>
      client.get<{ success: boolean; data: Post }>(endpoints.feed.postDetail(postId)),

    saveDraft: (data: CreatePostRequest) =>
      client.post<CreatePostResponse, CreatePostRequest>(endpoints.feed.drafts, data),

    updateDraft: (postId: string, data: CreatePostRequest) =>
      client.put<CreatePostResponse, CreatePostRequest>(endpoints.feed.updateDraft(postId), data),

    publishDraft: (postId: string) =>
      client.post<{ success: boolean; data: Post }>(endpoints.feed.publish(postId), {}),

    deletePost: (postId: string) =>
      client.delete<{ success: boolean }>(endpoints.feed.postDetail(postId)),

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

    getComments: (postId: string) =>
      client.get<CommentsResponse>(endpoints.feed.comments(postId)),

    createComment: (postId: string, content: string, parentCommentId?: string) =>
      client.post<{ success: boolean; data: Comment }, { content: string; parent_comment_id?: string }>(
        endpoints.feed.createComment(postId),
        { content, ...(parentCommentId ? { parent_comment_id: parentCommentId } : {}) }
      ),

    likeComment: (commentId: string) =>
      client.post<{ success: boolean }>(endpoints.feed.likeComment(commentId), {}),

    unlikeComment: (commentId: string) =>
      client.delete<{ success: boolean }>(endpoints.feed.likeComment(commentId)),

    createReport: (payload: {
      target_type: 'post' | 'comment' | 'user';
      target_id: string;
      reason: string;
      details?: string;
    }) => client.post<{ success: boolean }>(endpoints.feed.reports, payload),
  };
}
