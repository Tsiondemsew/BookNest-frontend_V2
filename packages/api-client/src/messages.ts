import { ApiClient } from './client';
import { endpoints } from './endpoints';

export interface AuthorMessageItem {
  id: string;
  book_id: string | null;
  subject: string;
  body: string;
  message_type: string;
  read_at: string | null;
  created_at: string;
  books?: { id: string; title: string; status: string } | null;
}

export interface AuthorMessagesResponse {
  success: boolean;
  message?: string;
  data: {
    items: AuthorMessageItem[];
    notice?: string;
  };
}

export function createMessagesApi(client: ApiClient) {
  return {
    getMyMessages: (limit = 50) =>
      client.get<AuthorMessagesResponse>(endpoints.messages.list, {
        params: { limit },
      }),

    markRead: (messageId: string) =>
      client.patch<{ success: boolean; data: { id: string; read_at: string } }>(
        endpoints.messages.markRead(messageId),
        {},
      ),
  };
}
