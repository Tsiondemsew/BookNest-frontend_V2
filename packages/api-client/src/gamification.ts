import type { GamificationResponse } from '@repo/types';
import { ApiClient } from './client';
import { endpoints } from './endpoints';

export interface RecordActivityPayload {
  pages_delta?: number;
  minutes_delta?: number;
  seconds_delta?: number;
  timezone_offset_minutes?: number;
}

export function createGamificationApi(client: ApiClient) {
  const tz = () => -new Date().getTimezoneOffset();

  return {
    getMe: () =>
      client.get<GamificationResponse>(
        `${endpoints.gamification.me}?timezone_offset_minutes=${tz()}`
      ),
    recordActivity: (payload: RecordActivityPayload) =>
      client.post<{ success: boolean; data: { recorded: boolean } }>(
        endpoints.gamification.activity,
        {
          ...payload,
          timezone_offset_minutes: payload.timezone_offset_minutes ?? tz(),
        }
      ),
  };
}
