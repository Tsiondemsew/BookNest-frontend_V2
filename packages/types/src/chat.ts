export interface ChatParticipant {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isOnline?: boolean;
}

export interface Chat {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  participants: ChatParticipant[];
  participantCount?: number;
  lastMessage?: {
    content: string;
    senderId: string;
    senderName: string;
    createdAt: string;
    isRead: boolean;
  };
  unreadCount: number;
  updatedAt: string;
}

export interface ChatInviteResponse {
  token: string;
  inviteUrl: string;
  expiresAt: string;
}

export interface ChatMessage {
  id: string;
  content: string | null;
  postId?: string | null;
  sharedPost?: import('./feed').Post | null;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  isRead: boolean;
  isDeleted?: boolean;
  deletedForEveryone?: boolean;
  createdAt: string;
}

export interface ChatResponse {
  success: boolean;
  data: Chat[];
}

export interface ChatMessagesResponse {
  success: boolean;
  data: {
    messages: ChatMessage[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateGroupChatRequest {
  name: string;
  memberIds: string[];
}

export interface SendMessageRequest {
  content?: string;
  postId?: string;
}