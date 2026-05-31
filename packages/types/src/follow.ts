export interface FollowUser {
  id: string;
  name: string;
  username?: string | null;
  email?: string;
  avatarUrl?: string | null;
  bio?: string | null;
  role?: string;
}

export interface FollowListResponse {
  followers?: FollowUser[];
  following?: FollowUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
