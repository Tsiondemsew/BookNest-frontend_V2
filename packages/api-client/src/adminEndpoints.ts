export const adminEndpoints = {
  dashboard: '/api/admin/dashboard',
  users: '/api/admin/users',
  userStatus: (id: string) => `/api/admin/users/${id}/status`,
  invites: '/api/admin/invites',
  books: '/api/admin/books',
  bookReview: (id: string) => `/api/admin/books/${id}/review`,
  reports: '/api/admin/reports',
  reportUpdate: (id: string) => `/api/admin/reports/${id}`,
  withdrawals: '/api/admin/withdrawals',
  withdrawalReview: (id: string) => `/api/admin/withdrawals/${id}/review`,
} as const;
