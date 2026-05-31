'use client';

import { useEffect, useState, useCallback } from 'react';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';

export interface RealtimeMessage {
  id: string;
  content: string;
  sender_id: string;
  chat_id: string;
  is_read: boolean;
  post_id?: string | null;
  deleted_for_everyone_at?: string | null;
  created_at: string;
  users?: {
    id: string;
    email: string;
    avatar_url: string | null;
  };
}

type RealtimeStatus = 'SUBSCRIBED' | 'TIMED_OUT' | 'CLOSED' | 'CHANNEL_ERROR';

export function useRealtimeChat(chatId: string | null) {
  const { user } = useAuthStore();
  const [newMessages, setNewMessages] = useState<RealtimeMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const supabase = getSupabaseClient();

  useEffect(() => {
    if (!chatId || !user) return;

    console.log(`Subscribing to chat: ${chatId}`);

    const channel = supabase
      .channel(`chat:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload: RealtimePostgresChangesPayload<RealtimeMessage>) => {
          const newMessage = payload.new;
          if (newMessage && 'sender_id' in newMessage && newMessage.sender_id !== user.id) {
            setNewMessages((prev) => [...prev, newMessage]);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload: RealtimePostgresChangesPayload<RealtimeMessage>) => {
          const updated = payload.new;
          if (updated && 'id' in updated) {
            setNewMessages((prev) => {
              const without = prev.filter((m) => m.id !== updated.id);
              return [...without, updated];
            });
          }
        }
      )
      .subscribe((status: RealtimeStatus) => {
        console.log(`Realtime chat ${chatId} status:`, status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      console.log(`Unsubscribing from chat: ${chatId}`);
      supabase.removeChannel(channel);
    };
  }, [chatId, supabase, user]);

  const clearNewMessages = useCallback(() => {
    setNewMessages([]);
  }, []);

  return { newMessages, clearNewMessages, isConnected };
}