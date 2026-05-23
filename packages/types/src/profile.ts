import { Post } from './feed';
export interface ProfileSettings {
  is_public: boolean;
  show_email: boolean;
  show_reading_stats: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
}

export interface Profile {
  id: string;
  email: string;
  role: 'reader' | 'author' | 'publisher';
  publicName: string;
  bio?: string | null;
  location?: string | null;
  website_url?: string | null;
  avatar_url?: string | null;
  created_at: string;
  follower_count: number;
  following_count: number;
  post_count: number;
  settings: ProfileSettings;
}

export interface ProfileResponse {
  success: boolean;
  data: Profile;
}

export interface PublicProfile {
  id: string;
  name: string;
  username: string;
  role: string;
  avatarUrl?: string | null;
  bio?: string | null;
  location?: string | null;
  website?: string | null;
  joinedAt: string;
  followerCount: number;
  followingCount: number;
  postCount: number;
  isPrivate: boolean;
  isFollowing?: boolean;
}

export interface PublicProfileResponse {
  success: boolean;
  data: PublicProfile;
}

export interface UserPostsResponse {
  success: boolean;
  data: {
    posts: Post[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}