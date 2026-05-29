import type { EntityId, ISODateString } from './common';
export type UserRole = 'reader' | 'author' | 'publisher' | 'admin';
export type AccountStatus = 'active' | 'suspended' | 'disabled';
export interface User {
    id: EntityId;
    email: string;
    role: UserRole;
    account_status: AccountStatus;
    created_at: ISODateString;
    updated_at: ISODateString;
}
export interface SessionUser {
    id: EntityId;
    email: string;
    role: UserRole;
    account_status: AccountStatus;
    publicName: string;
    avatarUrl?: string;
}
export interface AuthSession {
    user: SessionUser;
    issuedAt: ISODateString;
    expiresAt: ISODateString;
}
export interface LoginRequest {
    email: string;
    password: string;
    remember_me?: boolean;
}
export interface LoginResponse {
    success: boolean;
    message?: string;
    data: AuthSession & {
        rememberMe?: boolean;
        needsGenreOnboarding?: boolean;
    };
}
export interface ConfirmEmailRequest {
    access_token: string;
}
export interface ConfirmEmailResponse {
    success: boolean;
    message?: string;
    data?: {
        email: string;
    };
}
export interface FavoriteGenresListResponse {
    success: boolean;
    data: Array<{
        id: string;
        slug?: string;
        name: string;
    }>;
    message?: string;
}
export interface RegisterRequest {
    email: string;
    password: string;
    display_name: string;
}
export interface ResendVerificationRequest {
    email: string;
}
export interface ResendVerificationResponse {
    success: boolean;
    message?: string;
}
export interface FavoriteGenresRequest {
    genre_ids: string[];
}
export interface FavoriteGenresResponse {
    success: boolean;
    message?: string;
}
export interface ForgotPasswordRequest {
    email: string;
}
export interface ForgotPasswordResponse {
    success: boolean;
    message?: string;
}
export interface ResetPasswordRequest {
    access_token: string;
    password: string;
    refresh_token?: string;
}
export interface ResetPasswordResponse {
    success: boolean;
    message?: string;
}
export interface RegisterResponse {
    success: boolean;
    message?: string;
    data: {
        email: string;
    };
}
export interface LogoutResponse {
    success: boolean;
    message?: string;
}
export interface MeResponse {
    success: boolean;
    data: AuthSession;
}
//# sourceMappingURL=auth.d.ts.map