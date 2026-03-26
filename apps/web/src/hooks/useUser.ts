'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Reader } from '@repo/types';

const USER_QUERY_KEY = ['user'] as const;

/**
 * useUserProfile - Fetch current user's profile data
 * Includes reading stats, preferences, etc.
 */
export function useUserProfile(userId: string | null) {
  return useQuery({
    queryKey: [USER_QUERY_KEY, userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');

      // TODO: Replace with actual API
      // const response = await fetch(`/api/users/${userId}`);
      // return response.json();

      return mockUserData;
    },
    enabled: !!userId,
  });
}

/**
 * useUpdateProfile - Mutation for updating user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Reader>) => {
      // TODO: Replace with actual API
      // const response = await fetch('/api/user/profile', {
      //   method: 'PATCH',
      //   body: JSON.stringify(data),
      // });
      // return response.json();

      return { ...mockUserData, ...data };
    },
    onSuccess: (updatedUser) => {
      // Update cache with new data
      queryClient.setQueryData([USER_QUERY_KEY, updatedUser.id], updatedUser);
    },
  });
}

/**
 * useUserReadingStats - Fetch user's reading statistics
 */
export function useUserReadingStats(userId: string | null) {
  return useQuery({
    queryKey: ['user-stats', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');

      // TODO: Replace with actual API
      // const response = await fetch(`/api/users/${userId}/stats`);
      // return response.json();

      return {
        totalBooksRead: 42,
        currentlyReading: 3,
        totalPagesRead: 12543,
        currentStreak: 15,
        longestStreak: 45,
        readingGoal: 25,
        booksReadThisYear: 8,
      };
    },
    enabled: !!userId,
  });
}

/**
 * useUpdateReadingPreferences - Mutation for updating reading preferences
 */
export function useUpdateReadingPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      favoriteGenres?: string[];
      fontSize?: number;
      themePreference?: 'light' | 'dark' | 'auto';
      readingGoal?: number;
    }) => {
      // TODO: Replace with actual API
      // const response = await fetch('/api/user/preferences', {
      //   method: 'PATCH',
      //   body: JSON.stringify(data),
      // });
      // return response.json();

      return { success: true, ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: USER_QUERY_KEY,
      });
    },
  });
}

/**
 * usePublicProfile - Fetch another user's public profile
 */
export function usePublicProfile(userId: string | null) {
  return useQuery({
    queryKey: ['public-profile', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');

      // TODO: Replace with actual API
      // const response = await fetch(`/api/users/${userId}/public`);
      // return response.json();

      return mockPublicProfile;
    },
    enabled: !!userId,
  });
}

// Mock data
const mockUserData: Reader = {
  id: 'user-1',
  email: 'user@example.com',
  displayName: 'John Reader',
  role: 'READER' as const,
  currentStreakDays: 15,
  longestStreakDays: 45,
  totalPagesRead: 12543,
  isProfileVisible: true,
  createdAt: new Date('2023-01-15'),
  updatedAt: new Date(),
};

const mockPublicProfile = {
  id: 'user-2',
  displayName: 'Jane Bookworm',
  totalBooksRead: 87,
  currentlyReading: 2,
  isProfileVisible: true,
  favoriteGenres: ['Fantasy', 'Mystery'],
  createdAt: new Date('2022-06-20'),
};
