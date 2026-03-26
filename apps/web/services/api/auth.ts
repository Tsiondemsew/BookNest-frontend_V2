import { API_ENDPOINTS } from '@repo/api-client';
import { UnauthorizedError } from '@repo/api-client';
import { UserRole } from '@repo/types';
import type { LoginRequest, LoginResponse, MeResponse, RegisterRequest, RegisterResponse } from './types';
import { getApiClient } from './client';

// Default to mock during early development; switch off only when backend is ready.
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false';

const MOCK_SESSION_KEY = 'booknest_mock_session_v1';

type MockSession = {
  token: string;
  user: Omit<LoginResponse['user'], 'createdAt' | 'updatedAt'> & {
    createdAt: string;
    updatedAt: string;
  };
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function getMockSessionFromStorage(): MockSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(MOCK_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MockSession;
  } catch {
    return null;
  }
}

function setMockSessionToStorage(session: MockSession): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(session));
}

function clearMockSessionStorage(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(MOCK_SESSION_KEY);
}

function buildMockUser(email: string, displayName?: string): LoginResponse['user'] {
  const now = new Date();

  return {
    id: 'mock-user-1',
    email,
    displayName: displayName ?? 'BookNest Reader',
    role: UserRole.READER,
    createdAt: now,
    updatedAt: now,
  };
}

export const authApi = {
  login: async (body: LoginRequest) => {
    if (USE_MOCK_API) {
      await wait(200);
      const user = buildMockUser(body.email);
      const session: MockSession = {
        token: 'mock-token',
        user: {
          ...user,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
      };
      setMockSessionToStorage(session);
      return { token: session.token, user: user };
    }
    return getApiClient().post<LoginResponse>(API_ENDPOINTS.auth.login, body);
  },

  register: async (body: RegisterRequest) => {
    if (USE_MOCK_API) {
      await wait(250);
      const user = buildMockUser(body.email, body.displayName);
      const session: MockSession = {
        token: 'mock-token',
        user: {
          ...user,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
      };
      setMockSessionToStorage(session);
      return { token: session.token, user };
    }
    return getApiClient().post<RegisterResponse>(API_ENDPOINTS.auth.register, body);
  },

  me: async () => {
    if (USE_MOCK_API) {
      await wait(150);
      const stored = getMockSessionFromStorage();
      if (!stored) throw new UnauthorizedError();

      const user: LoginResponse['user'] = {
        ...stored.user,
        createdAt: new Date(stored.user.createdAt),
        updatedAt: new Date(stored.user.updatedAt),
      };

      return { user } satisfies MeResponse;
    }
    return getApiClient().get<MeResponse>(API_ENDPOINTS.auth.me);
  },

  logout: async () => {
    if (USE_MOCK_API) {
      await wait(100);
      clearMockSessionStorage();
      return;
    }
    return getApiClient().post<void>(API_ENDPOINTS.auth.logout);
  },
};
