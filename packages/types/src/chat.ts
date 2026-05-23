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

export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  isRead: boolean;
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
  content: string;
}