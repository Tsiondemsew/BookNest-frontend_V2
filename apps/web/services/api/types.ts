import type { User } from '@repo/types';

export type LoginRequest = {
  email: string;
  password: string;
  role: string;
};

export type LoginResponse = {
  token: string;
  user: User;
};

export type RegisterRequest = {
  email: string;
  password: string;
  displayName: string;
};

export type RegisterResponse = {
  token: string;
  user: User;
};

export type MeResponse = {
  user: User;
};
