import { createChatApi } from '@repo/api-client';
import { apiClient } from './client';

export const chatApi = createChatApi(apiClient);

// Re-export types
export type { Chat, ChatMessage, ChatResponse, ChatMessagesResponse } from '@repo/types';