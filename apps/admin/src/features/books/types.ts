export type QueueStatus = 'all' | 'pending_review' | 'approved' | 'rejected';

export type SubmissionType = 'new_entry' | 'metadata_update';

export type SubmissionBadge = 'NEW' | 'UPDATE' | string;

export type SortOption = 'newest' | 'oldest' | 'title_asc' | 'title_desc';

export type FilterTab = 'all' | 'new_entry' | 'metadata_update' | 'resubmitted';



export interface PendingBookAuthor {

  id: string;

  publicName: string | null;

  email: string | null;

}



export interface ReviewMetadata {

  reason?: string;

  adminNotes?: string | null;

  suggestedFixes?: string | null;

  severity?: string;

  rejectedAt?: string;

  rejectedBy?: string;

}



export interface FieldChange {

  field: string;

  label: string;

  previous: string | null;

  proposed: string | null;

}

export interface BookSnapshot {
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  isbn?: string | null;
  author_name?: string | null;
  publisher_name?: string | null;
  language?: string | null;
  genre_id?: string | null;
  genre_name?: string | null;
  cover_image_url?: string | null;
  publication_date?: string | null;
  pdf_price?: number | string | null;
  audio_price?: number | string | null;
  bundle_price?: number | string | null;
  currency?: string | null;
}



export interface PendingBook {

  id: string;

  title: string;

  subtitle: string | null;

  isbn: string | null;

  description: string | null;

  author: PendingBookAuthor;

  publisherName?: string | null;

  genre: string | null;

  genreId: string | null;

  language: string | null;

  coverImageUrl: string | null;

  status: string;

  reviewNote?: string | null;

  reviewMetadata?: ReviewMetadata | null;

  submissionType: SubmissionType;

  type: SubmissionBadge;

  submittedAt: string;

  createdAt?: string;

  reviewedAt?: string | null;

  changes?: FieldChange[];

  previous?: BookSnapshot | null;

  proposed?: BookSnapshot | null;

  isNewEntry?: boolean;

  isResubmitted?: boolean;

  formatCount?: number;

  chapterCount?: number;

  activity?: { id: string; message: string; at: string; details?: unknown }[];

  reviewedBy?: { id: string; email: string } | null;

  approvedBy?: { id: string; email: string } | null;

  approvedAt?: string | null;

  rejectedAt?: string | null;

  isPublic?: boolean;
  updateNote?: string | null;
  submissionKind?: string | null;

  authorProfile?: {

    name: string;

    email: string | null;

    avatarUrl: string | null;

    bio: string | null;

    memberSince: string | null;

    publishedBooksCount: number;

  };

  stats?: {

    views: number;

    favorites: number;

    readingTimeMinutes: number;

    totalChapters: number;

  };

  formats?: BookFormatDetail[];
  formatSlots?: FormatSlots;

  reviewState?: ReviewState;
  revenueAgreement?: RevenueAgreement;
  pricing?: PricingInfo;
  visibility?: { isPublic: boolean; marketplaceVisible: boolean };
  drm?: { enabled: boolean; label: string };
  tags?: string[];
  versionNumber?: string;
  updateRequest?: { id: string; status: string; updateNote: string | null; submittedAt: string } | null;
  contentComparison?: ContentComparison;
  versionHistory?: VersionHistoryEntry[];
  auditTrail?: AuditEntry[];
  publicationDate?: string | null;
}

export interface BookFormatDetail {
  id: string | null;
  formatType: string;
  price: number | null;
  currency: string;
  fileUrl: string | null;
  fileName: string | null;
  storagePath?: string | null;
  mimeType?: string | null;
  fileSizeBytes: number | null;
  pageCount: number | null;
  durationSec: number | null;
  uploadedAt: string | null;
  hasContent?: boolean;
  missing?: boolean;
  playbackUrl?: string | null;
  isDemoContent?: boolean;
  demoLabel?: string | null;
}

export interface FormatSlots {
  pdf: BookFormatDetail;
  audio: BookFormatDetail;
}

export type ChangeDecisionStatus = 'pending' | 'approved' | 'rejected';

export interface ReviewState {
  checklist: Record<string, boolean>;
  pdfReview: ContentReviewStatus;
  audioReview: ContentReviewStatus;
  changeDecisions?: Record<string, ChangeDecisionStatus>;
}

export interface ContentReviewStatus {
  status: 'pending' | 'approved' | 'changes_requested' | 'rejected';
  comment: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
}

export interface RevenueAgreement {
  signed: boolean;
  version: string;
  acceptedAt: string | null;
  acceptedTime: string | null;
  authorName: string | null;
  authorEmail: string | null;
  ipAddress: string | null;
  signature: unknown;
}

export interface PricingInfo {
  pdfPrice: number | null;
  audioPrice: number | null;
  bundlePrice: number | null;
  currency: string;
  discountPercent: number | null;
  discountLabel: string | null;
  authorRevenueSharePercent: number;
  platformSharePercent: number;
  estimatedAuthorEarnings: number;
  platformEarnings: number;
}

export interface ContentComparison {
  pdf: { current: BookFormatDetail | null; proposed: BookFormatDetail | null };
  audio: { current: BookFormatDetail | null; proposed: BookFormatDetail | null };
}

export interface VersionHistoryEntry {
  id: string;
  version: string;
  status: string;
  at: string;
  reason: string | null;
}

export interface AuditEntry {
  id: string;
  adminId: string | null;
  action: string;
  oldValue: unknown;
  newValue: unknown;
  comments: string | null;
  at: string;
}




export interface RejectPayload {

  reason: string;

  adminNotes?: string;

  suggestedFixes?: string;

  severity?: 'low' | 'medium' | 'high';

  notify?: boolean;

}



export interface BooksListResponse {

  success: boolean;

  data: {

    items: PendingBook[];

    status: QueueStatus;

    pagination: {

      page: number;

      limit: number;

      total: number;

      totalPages: number;

    };

  };

}



export interface QueueStats {

  pending: number;

  approved: number;

  rejected: number;

  reviewedToday: number;

  resubmitted?: number;

  totalBooks?: number;

  totalAuthors?: number;

}

