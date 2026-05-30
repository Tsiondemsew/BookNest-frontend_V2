export interface BookReview {
  id: string;
  rating: number;
  body: string | null;
  reviewer_role: 'reader' | 'author' | 'publisher';
  created_at: string;
  user: { id: string; display_name: string };
}

export interface BookReviewsResponse {
  success: boolean;
  data: BookReview[];
}

export interface CreateReviewRequest {
  rating: number;
  body?: string;
}

export interface CanReviewResponse {
  success: boolean;
  data: {
    can_review: boolean;
    existing_review: BookReview | null;
  };
}

export interface SellerCatalogReview extends BookReview {
  book_id: string;
  book_title: string;
  book_cover_url: string | null;
}

export interface SellerReviewsResponse {
  success: boolean;
  data: {
    reviews: SellerCatalogReview[];
    total: number;
    summary: {
      total_reviews: number;
      avg_rating: number;
    };
  };
}
