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
          console.log('New message payload:', payload);
          const newMessage = payload.new;
          // Check if newMessage exists and has sender_id
          if (newMessage && 'sender_id' in newMessage && newMessage.sender_id !== user.id) {
            setNewMessages(prev => [...prev, newMessage]);
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
          console.log('Message update payload:', payload);
          const updated = payload.new;
          if (updated && 'id' in updated && 'is_read' in updated) {
            setNewMessages(prev =>
              prev.map(msg =>
                msg.id === updated.id ? { ...msg, is_read: updated.is_read } : msg
              )
            );
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