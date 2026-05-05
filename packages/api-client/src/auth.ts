import type {
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  MeResponse,
  RegisterRequest,    // ← Add this
  RegisterResponse,   // ← Add this
} from '@repo/types';
import { ApiClient } from './client';
import { endpoints } from './endpoints';


export function createAuthApi(client: ApiClient) {
  return {
    login: (payload: LoginRequest) =>
      client.post<LoginResponse, LoginRequest>(endpoints.auth.login, payload),
    register: (payload: RegisterRequest) =>   // ← Add this
      client.post<RegisterResponse, RegisterRequest>(endpoints.auth.register, payload),
    logout: () => client.post<LogoutResponse>(endpoints.auth.logout, undefined),
    me: () => client.get<MeResponse>(endpoints.auth.me),
  };
}