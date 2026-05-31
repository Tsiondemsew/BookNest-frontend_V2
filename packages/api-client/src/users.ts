import type { CommunityUserSearchResult } from '@repo/types';
import { ApiClient } from './client';
import { endpoints } from './endpoints';

export interface UserSearchResult {
  id: string;
  name: string;
  role: string;
}

export function createUsersApi(client: ApiClient) {
  return {
    searchUsers: (params: { role: 'author' | 'publisher'; q: string }) => {
      const searchParams = new URLSearchParams();
      searchParams.append('role', params.role);
      searchParams.append('q', params.q);
      return client.get<{ success: boolean; data: UserSearchResult[] }>(
        `${endpoints.users.search}?${searchParams.toString()}`
      );
    },

    searchCommunityUsers: (q: string) => {
      const searchParams = new URLSearchParams();
      searchParams.append('q', q);
      searchParams.append('community', 'true');
      return client.get<{ success: boolean; data: CommunityUserSearchResult[] }>(
        `${endpoints.users.search}?${searchParams.toString()}`
      );
    },

    updatePresence: () =>
      client.post<{ success: boolean; data: { lastSeenAt: string } }>(
        endpoints.users.presence,
        {}
      ),
  };
}
