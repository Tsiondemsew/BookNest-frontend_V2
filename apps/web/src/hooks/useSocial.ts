'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Post, Comment } from '@repo/types';

const POSTS_QUERY_KEY = ['posts'] as const;
const COMMENTS_QUERY_KEY = ['comments'] as const;

interface PostsFilters {
  page?: number;
  limit?: number;
  userId?: string;
}

/**
 * usePosts - Fetch social feed posts
 */
export function usePosts(filters?: PostsFilters) {
  const queryKey = [POSTS_QUERY_KEY, filters].filter(Boolean);

  return useQuery({
    queryKey,
    queryFn: async () => {
      // TODO: Replace with actual API
      // const params = new URLSearchParams(filters);
      // const response = await fetch(`/api/posts?${params}`);
      // return response.json();

      return mockPostsData;
    },
  });
}

/**
 * usePost - Fetch single post by ID
 */
export function usePost(postId: string | null) {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      if (!postId) throw new Error('Post ID required');

      // TODO: Replace with actual API
      // const response = await fetch(`/api/posts/${postId}`);
      // return response.json();

      return mockPostsData[0]; // Mock
    },
    enabled: !!postId,
  });
}

/**
 * usePostComments - Fetch comments for a post
 */
export function usePostComments(postId: string | null) {
  return useQuery({
    queryKey: [COMMENTS_QUERY_KEY, postId],
    queryFn: async () => {
      if (!postId) throw new Error('Post ID required');

      // TODO: Replace with actual API
      // const response = await fetch(`/api/posts/${postId}/comments`);
      // return response.json();

      return [];
    },
    enabled: !!postId,
  });
}

/**
 * useCreatePost - Mutation for creating a new post
 */
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { textContent: string; mediaUrl?: string }) => {
      // TODO: Replace with actual API
      // const response = await fetch('/api/posts', {
      //   method: 'POST',
      //   body: JSON.stringify(data),
      // });
      // return response.json();

      return {
        postId: 'post-' + Date.now(),
        ...data,
        userId: 'user-1',
        timestamp: new Date(),
        shareCount: 0,
      };
    },
    onSuccess: () => {
      // Invalidate posts cache
      queryClient.invalidateQueries({
        queryKey: POSTS_QUERY_KEY,
      });
    },
  });
}

/**
 * useDeletePost - Mutation for deleting a post
 */
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      // TODO: Replace with actual API
      // const response = await fetch(`/api/posts/${postId}`, {
      //   method: 'DELETE',
      // });
      // return response.json();

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: POSTS_QUERY_KEY,
      });
    },
  });
}

/**
 * useLikePost - Mutation for liking/unliking a post
 */
export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      // TODO: Replace with actual API
      // const response = await fetch(`/api/posts/${postId}/like`, {
      //   method: 'POST',
      // });
      // return response.json();

      return { success: true, postId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: POSTS_QUERY_KEY,
      });
    },
  });
}

/**
 * useAddComment - Mutation for adding a comment
 */
export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { postId: string; content: string }) => {
      // TODO: Replace with actual API
      // const response = await fetch(`/api/posts/${data.postId}/comments`, {
      //   method: 'POST',
      //   body: JSON.stringify({ content: data.content }),
      // });
      // return response.json();

      return {
        commentId: 'comment-' + Date.now(),
        ...data,
        userId: 'user-1',
        timestamp: new Date(),
      };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [COMMENTS_QUERY_KEY, variables.postId],
      });
    },
  });
}

// Mock data
const mockPostsData: Post[] = [
  {
    postId: 'post-1',
    userId: 'user-1',
    textContent: 'Just finished reading an amazing book!',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    shareCount: 5,
  },
  {
    postId: 'post-2',
    userId: 'user-2',
    textContent: 'What are your favorite book recommendations?',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    shareCount: 12,
  },
];
