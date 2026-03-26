// Enums
export enum UserRole {
  READER = 'READER',
  AUTHOR = 'AUTHOR',
  PUBLISHER = 'PUBLISHER',
  ADMIN = 'ADMIN',
}

export enum FormatType {
  PDF = 'PDF',
  AUDIO = 'AUDIO',
  EPUB = 'EPUB',
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// Core domain types
export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  profileImage?: string;
  favoriteGenres?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Reader extends User {
  role: UserRole.READER;
  currentStreakDays: number;
  longestStreakDays: number;
  totalPagesRead: number;
  isProfileVisible: boolean;
}

export interface Author extends User {
  role: UserRole.AUTHOR;
  bio?: string;
  website?: string;
  // Additional author-specific fields
}

export interface Publisher extends User {
  role: UserRole.PUBLISHER;
  companyName: string;
  taxId?: string;
}

export interface Admin extends User {
  role: UserRole.ADMIN;
  sessionKey: string;
}

export interface Book {
  bookId: string;
  isbn?: string;
  title: string;
  description: string;
  coverImageUrl: string;
  publicationDate: Date;
  language: string;
  status: ApprovalStatus;
  // Relations
  author: Author;
  editions: BookEdition[];
}

export interface BookEdition {
  editionId: string;
  format: FormatType;
  price: number;
  fileSizeMB: number;
  durationMinutes?: number; // for audio
  encryptedFileBlob?: Blob; // for offline storage, not part of API
  // Book reference
  bookId: string;
}

export interface Transaction {
  transactionId: string;
  amountPaid: number;
  currency: string;
  purchaseDate: Date;
  isSuccessful: boolean;
  editionId: string;
  userId: string;
  generateReceipt(): string; // Method, but we'll just keep as data
}

// Social types
export interface Post {
  postId: string;
  userId: string;
  textContent: string;
  mediaUrl?: string;
  timestamp: Date;
  shareCount: number;
  comments?: Comment[];
}

export interface Comment {
  commentId: string;
  postId: string;
  userId: string;
  content: string;
  timestamp: Date;
}

export interface Chat {
  chatId: string;
  userIds: string[];
  createdAt: Date;
  messages: Message[];
}

export interface Message {
  messageId: string;
  chatId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

// Response types for API
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}