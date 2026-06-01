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
  profile_data?: Record<string, string> | null;
}

export interface ProfileResponse {
  success: boolean;
  data: Profile;
}

export interface ProfilePhoto {
  id: string;
  imageUrl: string;
  sortOrder?: number;
  createdAt?: string;
}

export interface PublicProfile {
  id: string;
  name: string;
  username: string;
  role: string;
  avatarUrl?: string | null;
  photos?: ProfilePhoto[];
  bio?: string | null;
  location?: string | null;
  website?: string | null;
  email?: string;
  joinedAt: string;
  followerCount?: number;
  followingCount?: number;
  postCount?: number;
  isPrivate: boolean;
  isFollowing?: boolean;
  isOwnProfile?: boolean;
  readingStats?: {
    current_streak: number;
    longest_streak?: number;
    books_completed: number;
    total_pages: number;
    total_minutes: number;
  };
  achievements?: Array<{ id: string; title: string; icon?: string; earned_at: string }>;
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