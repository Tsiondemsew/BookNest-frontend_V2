export interface ApiConfig {
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
  credentials?: RequestCredentials;
  timeout?: number;
}

export function createApiConfig(config: ApiConfig): Required<ApiConfig> {
  return {
    baseUrl: config.baseUrl,
    defaultHeaders: config.defaultHeaders ?? {
      'Content-Type': 'application/json',
    },
    credentials: config.credentials ?? 'include',
    timeout: config.timeout ?? 30000,
  };
}