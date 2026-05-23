export interface PostAuthor {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string | null;
  role: 'reader' | 'author' | 'publisher';
}

export interface Post {
  id: string;
  content: string;
  imageUrl?: string | null;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLiked: boolean;
  isSaved?: boolean;
  createdAt: string;
  author: PostAuthor;
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
  image_url?: string;
}

export interface CreatePostResponse {
  success: boolean;
  data: Post;
}
