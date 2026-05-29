'use client';

import { useCallback, useEffect, useState } from 'react';
import { Mail, MailOpen } from 'lucide-react';
import type { AuthorMessageItem } from '@repo/api-client';
import { apiClient } from '@/lib/api/client';

export function AuthorReviewInbox() {
  const [items, setItems] = useState<AuthorMessageItem[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<{
        success: boolean;
        data: { items: AuthorMessageItem[]; notice?: string };
      }>('/api/messages', { params: { limit: 30 } });

      setItems(res.data?.items ?? []);
      setNotice(res.data?.notice ?? null);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const markRead = async (id: string) => {
    try {
      await apiClient.patch(`/api/messages/${id}/read`, {});
      setItems((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, read_at: new Date().toISOString() } : m,
        ),
      );
    } catch {
      /* ignore */
    }
  };

  const unread = items.filter((m) => !m.read_at).length;

  if (loading) {
    return (
      <div className="rounded-xl border border-[#E8E2D9] bg-white p-6 animate-pulse">
        <div className="h-5 w-40 bg-[#E8E2D9] rounded mb-3" />
        <div className="h-16 bg-[#F5F1EB] rounded" />
      </div>
    );
  }

  if (!items.length && !notice) {
    return null;
  }

  return (
    <section className="rounded-xl border border-[#E8E2D9] bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-[#E8E2D9] px-5 py-4">
        <div className="flex items-center gap-2">
          <Mail size={18} className="text-[#B85C38]" />
          <h2 className="text-lg font-semibold text-[#1A2A3A]">Review feedback</h2>
          {unread > 0 && (
            <span className="rounded-full bg-[#B85C38] px-2 py-0.5 text-xs font-semibold text-white">
              {unread} new
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={load}
          className="text-sm text-[#B85C38] hover:underline"
        >
          Refresh
        </button>
      </div>

      {notice && (
        <p className="px-5 py-3 text-sm text-amber-800 bg-amber-50 border-b border-amber-100">
          {notice}
        </p>
      )}

      <ul className="divide-y divide-[#E8E2D9]">
        {items.map((msg) => {
          const open = expandedId === msg.id;
          const isUnread = !msg.read_at;
          return (
            <li key={msg.id}>
              <button
                type="button"
                className="w-full text-left px-5 py-4 hover:bg-[#F5F1EB]/60 transition-colors"
                onClick={() => {
                  const next = open ? null : msg.id;
                  setExpandedId(next);
                  if (!open && isUnread) markRead(msg.id);
                }}
              >
                <div className="flex items-start gap-3">
                  {isUnread ? (
                    <Mail size={18} className="text-[#B85C38] mt-0.5 shrink-0" />
                  ) : (
                    <MailOpen size={18} className="text-[#8E735B] mt-0.5 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[#1A2A3A] truncate">{msg.subject}</p>
                    {msg.books?.title && (
                      <p className="text-xs text-[#4A5568] mt-0.5">Book: {msg.books.title}</p>
                    )}
                    <p className="text-xs text-[#8E735B] mt-1">
                      {new Date(msg.created_at).toLocaleString()}
                    </p>
                    {open && (
                      <pre className="mt-3 whitespace-pre-wrap text-sm text-[#4A5568] font-sans">
                        {msg.body}
                      </pre>
                    )}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
