export type NotificationType = 'follow' | 'message' | 'post';

export interface NotificationActor {
  id: string;
  name: string;
  avatarUrl?: string | null;
  username?: string | null;
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  url?: string | null;
  isRead: boolean;
  createdAt: string;
  actor?: NotificationActor | null;
  metadata?: Record<string, unknown>;
}

export interface NotificationsResponse {
  notifications: AppNotification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UnreadCountResponse {
  count: number;
}
