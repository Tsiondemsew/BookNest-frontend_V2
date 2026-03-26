import { HttpClient } from '@repo/api-client';

function getApiBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';
  return baseUrl.replace(/\/$/, '');
}

let client: HttpClient | null = null;

export function getApiClient(): HttpClient {
  if (!client) {
    client = new HttpClient(getApiBaseUrl());
  }
  return client;
}

export const apiClient = getApiClient();
