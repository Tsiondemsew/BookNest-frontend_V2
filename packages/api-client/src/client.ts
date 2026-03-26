import { ApiError, UnauthorizedError, ForbiddenError, NotFoundError, NetworkError, OfflineError } from './errors';
import { offlineQueue } from './offlineQueue';

export class HttpClient {
  private baseUrl: string;
  private getToken: () => string | null;

  constructor(baseUrl: string, getToken: () => string | null) {
    this.baseUrl = baseUrl;
    this.getToken = getToken;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = new Headers(options.headers);

    const token = this.getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const config: RequestInit = {
      ...options,
      // Needed for cross-origin API cookies (e.g. HttpOnly session cookies).
      credentials: options.credentials ?? 'include',
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) throw new UnauthorizedError();
        if (response.status === 403) throw new ForbiddenError();
        if (response.status === 404) throw new NotFoundError();
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(response.status, errorData.message || 'API error');
      }

      if (response.status === 204) return {} as T;

      return await response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new NetworkError();
      }
      throw error;
    }
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}