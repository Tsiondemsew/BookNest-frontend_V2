import type { GamificationResponse } from '@repo/types';
import { ApiClient } from './client';
import { endpoints } from './endpoints';

export function createGamificationApi(client: ApiClient) {
  return {
    getMe: () => client.get<GamificationResponse>(endpoints.gamification.me),
  };
}
