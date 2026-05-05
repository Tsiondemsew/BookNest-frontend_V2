export const endpoints = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
    profile: '/api/auth/profile',
    
  },
  books: {
    list: '/api/books',
    detail: (id: string) => `/api/books/${id}`,
    genres: '/api/books/genres',
    search: '/api/books/search',
    myBooks: '/api/books/my-books',
  },
  wishlist: {
    list: '/api/wishlist',
    add: '/api/wishlist',
    remove: (bookId: string) => `/api/wishlist/${bookId}`,
    check: (bookId: string) => `/api/wishlist/${bookId}/check`,
    count: '/api/wishlist/count',
  },
  analytics: {
    sales: '/api/analytics/sales',
  },
  seller: {
    profile: (userId: string) => `/api/seller/${userId}`,
  },
  // NEW: Cart endpoints
  cart: {
    get: '/api/cart',
    addItem: '/api/cart/items',
    updateItem: (itemId: string) => `/api/cart/items/${itemId}`,
    removeItem: (itemId: string) => `/api/cart/items/${itemId}`,
    clear: '/api/cart',
  },
  // NEW: Checkout endpoints
  checkout: {
    initialize: '/api/checkout',
    verify: '/api/checkout/verify',
  },
} as const;