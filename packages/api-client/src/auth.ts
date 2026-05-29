import type {
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  MeResponse,
  RegisterRequest,
  RegisterResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
  FavoriteGenresRequest,
  FavoriteGenresResponse,
  FavoriteGenresListResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ConfirmEmailRequest,
  ConfirmEmailResponse,
} from '@repo/types';
import { ApiClient } from './client';
import { endpoints } from './endpoints';

export function createAuthApi(client: ApiClient) {
  return {
    login: (payload: LoginRequest) =>
      client.post<LoginResponse, LoginRequest>(endpoints.auth.login, payload),
    register: (payload: RegisterRequest) =>
      client.post<RegisterResponse, RegisterRequest>(endpoints.auth.register, payload),
    resendVerification: (payload: ResendVerificationRequest) =>
      client.post<ResendVerificationResponse, ResendVerificationRequest>(endpoints.auth.resendVerification, payload),
    favoriteGenres: (payload: FavoriteGenresRequest) =>
      client.post<FavoriteGenresResponse, FavoriteGenresRequest>(endpoints.auth.favoriteGenres, payload),
    getFavoriteGenres: () =>
      client.get<FavoriteGenresListResponse>(endpoints.auth.favoriteGenres),
    forgotPassword: (payload: ForgotPasswordRequest) =>
      client.post<ForgotPasswordResponse, ForgotPasswordRequest>(endpoints.auth.forgotPassword, payload),
    resetPassword: (payload: ResetPasswordRequest) =>
      client.post<ResetPasswordResponse, ResetPasswordRequest>(endpoints.auth.resetPassword, payload),
    confirmEmail: (payload: ConfirmEmailRequest) =>
      client.post<ConfirmEmailResponse, ConfirmEmailRequest>(endpoints.auth.confirmEmail, payload),
    logout: () => client.post<LogoutResponse>(endpoints.auth.logout, undefined),
    me: () => client.get<MeResponse>(endpoints.auth.me),
  };
}