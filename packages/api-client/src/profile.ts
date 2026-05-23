import type { ProfileResponse, PublicProfileResponse, UserPostsResponse } from '@repo/types';
import { ApiClient } from './client';
import { endpoints } from './endpoints';

export function createProfileApi(client: ApiClient) {
  return {
    // Get own profile
    getProfile: () => client.get<ProfileResponse>(endpoints.profile.me),

    // Update profile
    updateProfile: (data: {
      display_name?: string;
      pen_name?: string;
      company_name?: string;
      bio?: string;
      location?: string;
      website_url?: string;
    }) => client.put<{ success: boolean }>(endpoints.profile.me, data),

    // Upload avatar
    uploadAvatar: (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      return client.post<{ success: boolean; data: { avatar_url: string } }>(
        endpoints.profile.avatar,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
    },

    // Update settings
    updateSettings: (settings: {
      is_public: boolean;
      show_email: boolean;
      show_reading_stats: boolean;
      email_notifications: boolean;
      push_notifications: boolean;
      marketing_emails: boolean;
    }) => client.put<{ success: boolean }>(endpoints.profile.settings, settings),

    // Get public profile by username
    getPublicProfile: (username: string) =>
      client.get<PublicProfileResponse>(endpoints.profile.public(username)),

    // Get user posts (for public profile)
    getUserPosts: (userId: string, page?: number, limit?: number) => {
      const params = new URLSearchParams();
      if (page) params.append('page', String(page));
      if (limit) params.append('limit', String(limit));
      const url = params.toString()
        ? `${endpoints.profile.userPosts(userId)}?${params.toString()}`
        : endpoints.profile.userPosts(userId);
      return client.get<UserPostsResponse>(url);
    },
  };
}