export interface CartItem {
  id: string;
  cart_id: string;
  book_format_id: string;
  added_at: string;
  book_format?: {
    id: string;
    format_type: 'PDF' | 'Audio';
    price: number;
    currency: string;
    book: {
      id: string;
      title: string;
      cover_image_url: string;
      author_name: string;
    };
  };
}

export interface Cart {
  id: string;
  user_id: string;
  items: CartItem[];
  total: number;
}

export interface AddToCartRequest {
  book_format_id: string;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CartResponse {
  success: boolean;
  data: Cart;
}

export interface CheckoutRequest {
  book_format_id: string;
}

export interface CheckoutResponse {
  success: boolean;
  data: {
    transaction_id: string;
    transaction_number: string;
    checkout_url: string;
    amount: number;
  };
}