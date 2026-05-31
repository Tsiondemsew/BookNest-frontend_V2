export interface PostAuthor {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string | null;
  role: 'reader' | 'author' | 'publisher';
}

export interface PostUserTag {
  id: string;
  type: 'user';
  name: string;
  username: string;
  avatarUrl?: string | null;
}

export interface PostBookTag {
  id: string;
  type: 'book';
  title: string;
  coverUrl?: string | null;
}

export type PostTag = PostUserTag | PostBookTag;

export interface Post {
  id: string;
  content: string;
  imageUrl?: string | null;
  status?: 'draft' | 'published';
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLiked: boolean;
  isSaved?: boolean;
  createdAt: string;
  author: PostAuthor;
  tags?: PostTag[];
}

export interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string | null;
  };
  likeCount: number;
  isLiked: boolean;
  replyCount: number;
  replies?: Comment[];
  createdAt: string;
}

export interface FeedResponse {
  success: boolean;
  data: {
    posts: Post[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreatePostRequest {
  content: string;
  image_url?: string | null;
  tagged_users?: string[];
  tagged_books?: string[];
}

export interface CreatePostResponse {
  success: boolean;
  data: Post;
}

export interface CommentsResponse {
  success: boolean;
  data: { comments: Comment[] };
}

export interface CommunityUserSearchResult {
  id: string;
  name: string;
  email?: string;
  username?: string;
  avatarUrl?: string | null;
  role: string;
}
