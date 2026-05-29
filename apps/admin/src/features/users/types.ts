export type UserVerificationStatus = 'verified' | 'pending' | 'registered' | 'inactive';
export type UserSystemStatus = 'active' | 'banned';
export type UserSegmentFilter = 'all' | 'verified_authors' | 'banned' | 'pending';

export interface ReaderProfileDetail {
  type: 'reader';
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
}

export interface AuthorProfileDetail {
  type: 'author';
  penName: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  websiteUrl: string | null;
}

export interface PublisherProfileDetail {
  type: 'publisher';
  companyName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  websiteUrl: string | null;
  supportEmail: string | null;
}

export interface AdminProfileDetail {
  type: 'admin';
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
}

export type UserProfileDetail =
  | ReaderProfileDetail
  | AuthorProfileDetail
  | PublisherProfileDetail
  | AdminProfileDetail;

export interface AdminUserRow {
  id: string;
  email: string;
  name: string;
  initials: string;
  avatarUrl: string | null;
  role: string;
  verificationStatus: UserVerificationStatus;
  systemStatus: UserSystemStatus;
  accountStatus: string;
  banReason?: string | null;
  statusUpdatedAt?: string | null;
  lastActivity: string;
  lastActivityAt: string;
  createdAt: string;
}

export interface UserBookSummary {
  id: string;
  title: string;
  status: string;
  genre: string | null;
  coverImageUrl: string | null;
  updatedAt: string;
  updatedLabel: string;
}

export interface AdminUserDetail extends AdminUserRow {
  profile: UserProfileDetail | null;
  books: UserBookSummary[];
  bookCount: number;
  memberSince: string;
}

export interface AdminUserStats {
  totalUsers: number;
  verifiedAuthors: number;
  verifiedPercent: number;
  bannedAccounts: number;
  pendingInvitations: number;
  byRole?: {
    readers: number;
    authors: number;
    publishers: number;
    admins: number;
  };
}

export interface AdminUsersResponse {
  items: AdminUserRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
