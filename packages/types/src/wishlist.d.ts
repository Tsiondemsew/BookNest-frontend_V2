export interface WishlistItem {
    id: string;
    reader_user_id: string;
    book_id: string;
    created_at: string;
    book?: {
        id: string;
        title: string;
        author_name: string;
        cover_image_url: string;
        formats: {
            format_type: string;
            price: number;
            currency: string;
        }[];
        avg_rating?: number;
        review_count?: number;
    };
}
export interface WishlistPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
export interface WishlistData {
    items: WishlistItem[];
    pagination: WishlistPagination;
}
export interface WishlistResponse {
    success: boolean;
    data: WishlistData;
}
export interface AddToWishlistRequest {
    book_id: string;
}
export interface AddToWishlistResponse {
    success: boolean;
    data: {
        id: string;
        book_id: string;
        created_at: string;
    };
}
export interface RemoveFromWishlistResponse {
    success: boolean;
    message: string;
}
export interface IsInWishlistResponse {
    success: boolean;
    data: {
        isInWishlist: boolean;
    };
}
export interface WishlistCountResponse {
    success: boolean;
    data: {
        count: number;
    };
}
//# sourceMappingURL=wishlist.d.ts.map