import type { ChatResponse, ChatMessagesResponse, CreateGroupChatRequest } from '@repo/types';
import { ApiClient } from './client';
import { endpoints } from './endpoints';

export function createChatApi(client: ApiClient) {
  return {
    // Get all chats for current user
    getChats: () => client.get<ChatResponse>(endpoints.chat.list),

    // Get or create direct chat with another user
    getOrCreateDirectChat: (otherUserId: string) =>
      client.post<{ success: boolean; data: { chat: any; isNew: boolean } }>(
        endpoints.chat.direct,
        { otherUserId }
      ),

    // Create group chat
    createGroupChat: (data: CreateGroupChatRequest) =>
      client.post<{ success: boolean; data: any }>(endpoints.chat.groups, data),

    // Get messages for a chat
    getMessages: (chatId: string, page?: number, limit?: number) => {
      const params = new URLSearchParams();
      if (page) params.append('page', String(page));
      if (limit) params.append('limit', String(limit));
      const url = params.toString() 
        ? `${endpoints.chat.messages(chatId)}?${params.toString()}`
        : endpoints.chat.messages(chatId);
      return client.get<ChatMessagesResponse>(url);
    },

    // Send a message
    sendMessage: (chatId: string, content: string) =>
      client.post<{ success: boolean; data: any }>(
        endpoints.chat.messages(chatId),
        { content }
      ),

    // Add member to group chat
    addGroupMember: (chatId: string, memberId: string) =>
      client.post<{ success: boolean }>(endpoints.chat.members(chatId), { memberId }),

    // Remove member from group chat
    removeGroupMember: (chatId: string, memberId: string) =>
      client.delete<{ success: boolean }>(endpoints.chat.member(chatId, memberId)),
  };
}