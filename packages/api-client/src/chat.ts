import type {
  ChatResponse,
  ChatMessagesResponse,
  CreateGroupChatRequest,
  ChatInviteResponse,
} from '@repo/types';
import { ApiClient } from './client';
import { endpoints } from './endpoints';

export function createChatApi(client: ApiClient) {
  return {
    getChats: () => client.get<ChatResponse>(endpoints.chat.list),

    getChat: (chatId: string) =>
      client.get<{ success: boolean; data: import('@repo/types').Chat }>(
        endpoints.chat.detail(chatId)
      ),

    getOrCreateDirectChat: (otherUserId: string) =>
      client.post<{ success: boolean; data: { chat: { id: string }; isNew: boolean } }>(
        endpoints.chat.direct,
        { otherUserId }
      ),

    createGroupChat: (data: CreateGroupChatRequest) =>
      client.post<{ success: boolean; data: { id: string } }>(endpoints.chat.groups, data),

    getMessages: (chatId: string, page?: number, limit?: number) => {
      const params = new URLSearchParams();
      if (page) params.append('page', String(page));
      if (limit) params.append('limit', String(limit));
      const url = params.toString()
        ? `${endpoints.chat.messages(chatId)}?${params.toString()}`
        : endpoints.chat.messages(chatId);
      return client.get<ChatMessagesResponse>(url);
    },

    sendMessage: (chatId: string, payload: { content?: string; postId?: string }) =>
      client.post<{ success: boolean; data: import('@repo/types').ChatMessage }>(
        endpoints.chat.messages(chatId),
        payload
      ),

    sharePost: (chatId: string, postId: string, content?: string) =>
      client.post<{ success: boolean; data: import('@repo/types').ChatMessage }>(
        endpoints.chat.messages(chatId),
        { postId, content: content?.trim() || undefined }
      ),

    deleteMessageForMe: (messageId: string) =>
      client.delete<{ success: boolean }>(endpoints.chat.deleteMessageForMe(messageId)),

    deleteMessageForEveryone: (messageId: string) =>
      client.delete<{ success: boolean }>(endpoints.chat.deleteMessageForEveryone(messageId)),

    createGroupInvite: (chatId: string) =>
      client.post<{ success: boolean; data: ChatInviteResponse }>(
        endpoints.chat.groupInvite(chatId)
      ),

    joinGroupViaInvite: (token: string) =>
      client.post<{ success: boolean; data: { id: string; name?: string } }>(
        endpoints.chat.join(token)
      ),

    addGroupMember: (chatId: string, memberId: string) =>
      client.post<{ success: boolean }>(endpoints.chat.members(chatId), { memberId }),

    removeGroupMember: (chatId: string, memberId: string) =>
      client.delete<{ success: boolean }>(endpoints.chat.member(chatId, memberId)),
  };
}
