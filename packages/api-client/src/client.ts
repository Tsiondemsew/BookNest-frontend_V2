import type { ApiErrorCode } from '@repo/types';
import { createApiConfig, type ApiConfig } from './config';
import {
  ApiClientError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from './errors';
import { parseApiErrorBody } from './parseApiError';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

const envApiUrl = (globalThis as any).process?.env?.NEXT_PUBLIC_API_URL;

export const apiConfig: ApiConfig = {
  baseUrl: envApiUrl || 'http://localhost:5000',
  credentials: 'include', // ✅ Explicitly set to include cookies
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
};

export interface RequestOptions<TBody = unknown> {
  method: HttpMethod;
  body?: TBody;
  headers?: Record<string, string>;
  params?: Record<string, string | number | undefined>;
  signal?: AbortSignal;
  credentials?: RequestCredentials;
}

export class ApiClient {
  private config: Required<ApiConfig>;

  constructor(config: ApiConfig) {
    this.config = createApiConfig(config);
  }

  private buildUrl(path: string, params?: Record<string, string | number | undefined>) {
    let url = `${this.config.baseUrl.replace(/\/+$/, '')}/${path.startsWith('/') ? path.slice(1) : path}`;

    if (params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      }
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return url;
  }

  async request<TResponse>(path: string, options: RequestOptions = { method: 'GET' }): Promise<TResponse> {
    const url = this.buildUrl(path, options.params);
    const headers: Record<string, string> = {
      ...this.config.defaultHeaders,
      ...(options.headers ?? {}),
    };

    const init: RequestInit = {
      method: options.method,
      credentials: options.credentials ?? this.config.credentials,
      headers,
      signal: options.signal,
    };

    const isFormData =
      typeof FormData !== 'undefined' && options.body instanceof FormData;

    // For FormData, never set Content-Type manually (browser sets boundary).
    if (isFormData && 'Content-Type' in headers) {
      delete headers['Content-Type'];
    }

    if (options.body !== undefined && options.method !== 'GET') {
      if (!headers['Content-Type']) {
        if (!isFormData) {
          headers['Content-Type'] = 'application/json';
        }
      }
      init.body = isFormData
        ? (options.body as BodyInit)
        : JSON.stringify(options.body);
    }

    const response = await fetch(url, init);
    const rawText = await response.text();
    const contentType = response.headers.get('content-type');

    const parsedBody =
      contentType?.includes('application/json') && rawText
        ? JSON.parse(rawText)
        : rawText;

    if (!response.ok) {
      const { message, code, details, existingBookId } = parseApiErrorBody(parsedBody);

      switch (response.status) {
        case 401:
          throw new UnauthorizedError(message, details);
        case 403:
          throw new ForbiddenError(message, details);
        case 404:
          throw new NotFoundError(message, details);
        case 409:
          throw new ConflictError(message, existingBookId);
        case 400:
        case 422:
          throw new ValidationError(message, details);
        case 500:
          throw new InternalServerError(message);
        default:
          throw new ApiClientError(
            (code as ApiErrorCode) || 'INTERNAL_ERROR',
            response.status,
            message,
            details
          );
      }
    }

    return parsedBody as TResponse;
  }

  get<TResponse>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<TResponse>(path, { ...(options ?? {}), method: 'GET' });
  }

  post<TResponse, TBody = unknown>(path: string, body: TBody, options?: Omit<RequestOptions<TBody>, 'method' | 'body'>) {
    return this.request<TResponse>(path, { ...(options ?? {}), method: 'POST', body });
  }

  put<TResponse, TBody = unknown>(path: string, body: TBody, options?: Omit<RequestOptions<TBody>, 'method' | 'body'>) {
    return this.request<TResponse>(path, { ...(options ?? {}), method: 'PUT', body });
  }

  delete<TResponse>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<TResponse>(path, { ...(options ?? {}), method: 'DELETE' });
  }

  patch<TResponse, TBody = unknown>(path: string, body: TBody, options?: Omit<RequestOptions<TBody>, 'method' | 'body'>) {
    return this.request<TResponse>(path, { ...(options ?? {}), method: 'PATCH', body });
  }
}
