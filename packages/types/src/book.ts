export interface Genre {
  id: string;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
}

export interface BookFormat {
  id: string;
  format_type: 'PDF' | 'Audio';
  price: number;
  currency: string;
  page_count?: number | null;
  duration_sec?: number | null;
  file_size_bytes?: number | null;
  storage_path?: string;
  file_url?: string | null; 
  is_active?: boolean;
}

export interface Book {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  isbn?: string | null;
  author_name: string;
  author_user_id?: string | null;
  publisher_name?: string | null;
  publisher_user_id?: string | null;
  language: string;
  publication_date?: string | null;
  cover_image_path: string;
  cover_image_url: string;
  genre_id: string;
  genre?: Genre;
  formats: BookFormat[];
  status: 'draft' | 'pending_review' | 'approved' | 'rejected';
  uploaded_by: string;
  uploaded_by_role?: 'author' | 'publisher';
  is_active: boolean;
  sales_count?: number;
  total_revenue?: number;
  avg_rating?: number;
  review_count?: number; 
  created_at: string;
  updated_at: string;
}

// ============================================
// NEW: Book Upload Types
// ============================================

export interface BookFormatInput {
  format_type: 'PDF' | 'Audio';
  price: number;
  currency?: string;  // Defaults to 'ETB'
  page_count?: number | null;
  duration_sec?: number | null;
  file: File;  // The actual file to upload
}

export interface CreateBookRequest {
  // Basic info
  title: string;
  subtitle?: string;
  description?: string;
  isbn?: string;
  language: string;
  publication_date?: string;
  
  // Genre
  genre_id: string;
  
  // Author/Publisher info
  author_name?: string;      // For publisher uploads, can suggest existing author
  author_user_id?: string;   // If author exists in system
  publisher_name?: string;   // For author uploads, can suggest existing publisher
  publisher_user_id?: string; // If publisher exists in system
  
  // Cover image
  cover_image: File;
  
  // Formats (at least one)
  formats: BookFormatInput[];
}

export interface CreateBookResponse {
  success: boolean;
  data: {
    book: Book;
    message: string;
  };
}

// ============================================
// NEW: Update Book Types
// ============================================

export interface UpdateBookRequest {
  title?: string;
  subtitle?: string;
  description?: string;
  isbn?: string;
  language?: string;
  publication_date?: string;
  genre_id?: string;
  author_name?: string;
  publisher_name?: string;
  is_active?: boolean;
}

export interface UpdateBookResponse {
  success: boolean;
  data: {
    book: Book;
    message: string;
  };
}

// ============================================
// NEW: My Books List Types
// ============================================

export interface MyBooksResponse {
  success: boolean;
  data: {
    books: Book[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// ============================================
// NEW: Delete Book Types
// ============================================

export interface DeleteBookResponse {
  success: boolean;
  message: string;
}

// ============================================
// NEW: Seller Profile Types
// ============================================

export interface SellerProfile {
  user: {
    id: string;
    email: string;
    role: 'author' | 'publisher';
    account_status: string;
  };
  profile: {
    // Author specific
    pen_name?: string;
    full_name?: string;
    // Publisher specific
    company_name?: string;
    // Common
    avatar_url?: string;
    bio?: string;
    website_url?: string;
    created_at: string;
  };
  books: Book[];
  total_books: number;
  total_sales: number;
  total_revenue: number;
}

export interface SellerProfileResponse {
  success: boolean;
  data: SellerProfile;
}

// ============================================
// NEW: Analytics Types
// ============================================

export interface SalesDataPoint {
  date: string;
  sales: number;
  revenue: number;
}

export interface BookSalesData {
  book_id: string;
  title: string;
  cover_image_url: string;
  copies_sold: number;
  revenue: number;
}

export interface AnalyticsResponse {
  success: boolean;
  data: {
    summary: {
      total_books: number;
      total_copies_sold: number;
      total_revenue: number;
      pending_approval: number;
      monthly_earnings: number;
    };
    sales_over_time: SalesDataPoint[];
    top_books: BookSalesData[];
  };
}

// ============================================
// NEW: Existing API Response Types (keep)
// ============================================

export interface BooksResponse {
  success: boolean;
  data: {
    books: Book[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface BookResponse {
  success: boolean;
  data: Book;
}

export interface GenresResponse {
  success: boolean;
  data: Genre[];
}

export interface LibraryFormat {
  id: string;
  type: 'PDF' | 'Audio';
  price: number;
  currency: string;
  storage_path: string;
  page_count?: number | null;
  duration_sec?: number | null;
  file_size_bytes?: number | null;
}

export interface LibraryBook {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  isbn?: string | null;
  author_name: string;
  publisher_name?: string | null;
  language: string;
  publication_date?: string | null;
  cover_image_url: string;
  status: string;
  created_at: string;
}

export interface LibraryItem {
  id: string;
  purchased_at: string;
  format: LibraryFormat;
  book: LibraryBook;
}

export interface Genre {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface LibraryResponse {
  success: boolean;
  data: LibraryItem[];
}