export const endpoints = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
    profile: '/api/auth/profile',
    
  },
  messages: {
    list: '/api/messages',
    markRead: (id: string) => `/api/messages/${id}/read`,
  },
  books: {
    list: '/api/books',
    detail: (id: string) => `/api/books/${id}`,
    genres: '/api/books/genres',
    search: '/api/books/search',
    myBooks: '/api/books/my-books',
    submissionTimeline: '/api/books/submission-timeline',
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

    chat: {
    list: '/api/chat',
    direct: '/api/chat/direct',
    groups: '/api/chat/groups',
    messages: (chatId: string) => `/api/chat/${chatId}/messages`,
    members: (chatId: string) => `/api/chat/${chatId}/members`,
    member: (chatId: string, memberId: string) => `/api/chat/${chatId}/members/${memberId}`,
  },
  feed: {
    list: '/api/feed',
    posts: '/api/feed/posts',
    drafts: '/api/feed/drafts',
    myPosts: '/api/feed/my-posts',
    like: (postId: string) => `/api/feed/posts/${postId}/like`,
    publish: (postId: string) => `/api/feed/drafts/${postId}/publish`,
    postDetail: (postId: string) => `/api/feed/posts/${postId}`,
    userPosts: (userId: string) => `/api/feed/users/${userId}/posts`,
  },
   profile: {
    me: '/api/users/profile',
    avatar: '/api/users/profile/avatar',
    settings: '/api/users/profile/settings',
    public: (username: string) => `/api/public/profile/${username}`,
    userPosts: (userId: string) => `/api/feed/users/${userId}/posts`,
  },
  follow: {
    follow: (userId: string) => `/api/follow/${userId}/follow`,
    unfollow: (userId: string) => `/api/follow/${userId}/follow`,
    toggle: (userId: string) => `/api/follow/${userId}/toggle`,
    isFollowing: (userId: string) => `/api/follow/${userId}/is-following`,
    followers: (userId: string) => `/api/follow/${userId}/followers`,
    following: (userId: string) => `/api/follow/${userId}/following`,
  },
  // Admin endpoints
  admin: {
    dashboard: {
      stats: '/api/admin/dashboard/stats',
      revenueChart: '/api/admin/dashboard/revenue',
      userChart: '/api/admin/dashboard/users',
      booksChart: '/api/admin/dashboard/books',
    },
    users: {
      list: '/api/admin/users',
      detail: (userId: string) => `/api/admin/users/${userId}`,
      ban: (userId: string) => `/api/admin/users/${userId}/ban`,
      unban: (userId: string) => `/api/admin/users/${userId}/unban`,
      updateRole: (userId: string) => `/api/admin/users/${userId}/role`,
    },
    books: {
      pending: '/api/admin/books/pending',
      detail: (bookId: string) => `/api/admin/books/${bookId}`,
      approve: (bookId: string) => `/api/admin/books/${bookId}/approve`,
      reject: (bookId: string) => `/api/admin/books/${bookId}/reject`,
    },
    reports: {
      list: '/api/admin/reports',
      detail: (reportId: string) => `/api/admin/reports/${reportId}`,
      resolve: (reportId: string) => `/api/admin/reports/${reportId}/resolve`,
    },
  },
} as const;