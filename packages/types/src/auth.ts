// packages/types/src/auth.ts

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
}

// ✅ FIXED: Add the 'data' wrapper
export interface LoginResponse {
  success: boolean;
  message?: string;
  data: AuthSession;
}

export interface RegisterRequest {
  email: string;
  password: string;
  display_name: string;
}

// ✅ FIXED: Add the 'data' wrapper
export interface RegisterResponse {
  success: boolean;
  message?: string;
  data: AuthSession;
}

export interface LogoutResponse {
  success: boolean;
  message?: string;
}

// ✅ FIXED: Add the 'data' wrapper
export interface MeResponse {
  success: boolean;
  data: AuthSession;
}