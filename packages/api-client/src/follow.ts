import { ApiClient } from './client';
import type { FollowListResponse } from '@repo/types';

export function createFollowApi(client: ApiClient) {
  return {
    follow: (userId: string) =>
      client.post<{ success: boolean }>(`/api/follow/${userId}/follow`, {}),
    unfollow: (userId: string) =>
      client.delete<{ success: boolean }>(`/api/follow/${userId}/follow`),
    isFollowing: (userId: string) =>
      client.get<{ success: boolean; data: { isFollowing: boolean } }>(
        `/api/follow/${userId}/is-following`
      ),
    getFollowers: (userId: string, page?: number, limit?: number) => {
      const params = new URLSearchParams();
      if (page) params.append('page', String(page));
      if (limit) params.append('limit', String(limit));
      const qs = params.toString();
      return client.get<{ success: boolean; data: FollowListResponse }>(
        qs ? `/api/follow/${userId}/followers?${qs}` : `/api/follow/${userId}/followers`
      );
    },
    getFollowing: (userId: string, page?: number, limit?: number) => {
      const params = new URLSearchParams();
      if (page) params.append('page', String(page));
      if (limit) params.append('limit', String(limit));
      const qs = params.toString();
      return client.get<{ success: boolean; data: FollowListResponse }>(
        qs ? `/api/follow/${userId}/following?${qs}` : `/api/follow/${userId}/following`
      );
    },
  };
}
