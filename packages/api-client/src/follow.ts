import { ApiClient } from './client';
import { endpoints } from './endpoints';

export function createFollowApi(client: ApiClient) {
  return {
    follow: (userId: string) => client.post<{ success: boolean }>(endpoints.follow.follow(userId)),
    unfollow: (userId: string) => client.delete<{ success: boolean }>(endpoints.follow.unfollow(userId)),
    toggleFollow: (userId: string) =>
      client.post<{
        success: boolean;
        data: { isFollowing: boolean; followerCount: number; followingCount: number };
      }>(endpoints.follow.toggle(userId)),
    isFollowing: (userId: string) =>
      client.get<{ success: boolean; data: { isFollowing: boolean } }>(endpoints.follow.isFollowing(userId)),
    getFollowers: (userId: string, page?: number, limit?: number) => {
      const params = new URLSearchParams();
      if (page) params.append('page', String(page));
      if (limit) params.append('limit', String(limit));
      const baseUrl = endpoints.follow.followers(userId);
      return client.get<{
        success: boolean;
        data: { followers: any[]; total: number; page: number; limit: number; totalPages: number };
      }>(params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl);
    },
    getFollowing: (userId: string, page?: number, limit?: number) => {
      const params = new URLSearchParams();
      if (page) params.append('page', String(page));
      if (limit) params.append('limit', String(limit));
      const baseUrl = endpoints.follow.following(userId);
      return client.get<{
        success: boolean;
        data: { following: any[]; total: number; page: number; limit: number; totalPages: number };
      }>(params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl);
    },
  };
}
