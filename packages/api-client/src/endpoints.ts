export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/auth/me',
  },
  books: {
    list: '/books',
    detail: (id: string) => `/books/${id}`,
    purchase: (id: string) => `/books/${id}/purchase`,
    read: (id: string) => `/books/${id}/read`,
  },
  community: {
    feed: '/feed',
    post: (id: string) => `/posts/${id}`,
    comments: (postId: string) => `/posts/${postId}/comments`,
    profile: (userId: string) => `/users/${userId}`,
    follow: (userId: string) => `/users/${userId}/follow`,
  },
  gamification: {
    streaks: '/gamification/streaks',
    progress: (bookId: string) => `/gamification/books/${bookId}/progress`,
    achievements: '/gamification/achievements',
  },
  studio: {
    upload: '/studio/books',
    analytics: '/studio/analytics',
  },
  admin: {
    approvals: '/admin/approvals',
    users: '/admin/users',
    reports: '/admin/reports',
  },
} as const;