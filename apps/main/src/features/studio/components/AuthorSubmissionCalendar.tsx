'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { booksApi } from '@/lib/api/client';
import { useAuthStore } from '@/stores/authStore';
import { AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';

type TimelineEvent = {
  id: string;
  bookId: string;
  bookTitle: string;
  type: string;
  status: string;
  at: string;
  updateNote: string | null;
  genre: string | null;
};

const EVENT_STYLES: Record<string, { bg: string; text: string; icon: typeof Clock }> = {
  created: { bg: '#F5F1EB', text: '#4A5568', icon: Clock },
  submitted: { bg: '#FEF3C7', text: '#D97706', icon: AlertCircle },
  metadata_update: { bg: '#DBEAFE', text: '#1D4ED8', icon: RefreshCw },
  pending_review: { bg: '#FEF3C7', text: '#D97706', icon: AlertCircle },
  approved: { bg: '#D1FAE5', text: '#2D6A4F', icon: CheckCircle },
  rejected: { bg: '#FEE2E2', text: '#DC2626', icon: AlertCircle },
};

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function AuthorSubmissionCalendar() {
  const { isAuthenticated } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['submission-timeline'],
    queryFn: () => booksApi.getSubmissionTimeline(),
    select: (res) => res.data?.events ?? [],
    enabled: isAuthenticated,
  });

  const events = (data ?? []) as TimelineEvent[];

  const calendarDays = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const first = new Date(year, month, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: { date: string; day: number; count: number }[] = [];
    for (let i = 0; i < startPad; i++) days.push({ date: '', day: 0, count: 0 });

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const count = events.filter((e) => e.at.startsWith(dateStr)).length;
      days.push({ date: dateStr, day: d, count });
    }
    return days;
  }, [events]);

  const filtered =
    selectedDate != null
      ? events.filter((e) => e.at.startsWith(selectedDate))
      : events;

  const monthLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[#E8E2D9] bg-white p-6 animate-pulse h-48" />
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Could not load submission history.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[#E8E2D9] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#1A2A3A]">Submission calendar</h2>
          <span className="text-sm text-[#4A5568]">{monthLabel}</span>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-[#4A5568] mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((cell, i) =>
            cell.day === 0 ? (
              <div key={`pad-${i}`} />
            ) : (
              <button
                key={cell.date}
                type="button"
                onClick={() =>
                  setSelectedDate(selectedDate === cell.date ? null : cell.date)
                }
                className={`relative flex h-10 flex-col items-center justify-center rounded-lg text-sm transition ${
                  selectedDate === cell.date
                    ? 'bg-[#B85C38] text-white'
                    : cell.count > 0
                      ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                      : 'hover:bg-[#F5F1EB] text-[#1A2A3A]'
                }`}
              >
                {cell.day}
                {cell.count > 0 && (
                  <span className="absolute bottom-1 h-1 w-1 rounded-full bg-current" />
                )}
              </button>
            ),
          )}
        </div>
        <p className="mt-3 text-xs text-[#4A5568]">
          Dots mark days with submission activity. Click a day to filter the timeline below.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-[#1A2A3A] uppercase tracking-wide">
          {selectedDate ? `Events on ${selectedDate}` : 'Recent activity'}
        </h3>
        {filtered.length === 0 && (
          <p className="text-sm text-[#4A5568]">No events for this period.</p>
        )}
        {filtered.map((event) => {
          const style = EVENT_STYLES[event.type] || EVENT_STYLES.submitted;
          const Icon = style.icon;
          return (
            <div
              key={event.id}
              className="rounded-xl border border-[#E8E2D9] bg-white p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: style.bg, color: style.text }}
                >
                  <Icon size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-[#1A2A3A]">{event.bookTitle}</p>
                  <p className="text-xs text-[#4A5568] capitalize">
                    {event.type.replace(/_/g, ' ')}
                    {event.genre ? ` · ${event.genre}` : ''}
                  </p>
                  <p className="text-xs text-[#8E735B] mt-0.5">{formatDay(event.at)}</p>
                  {event.updateNote && (
                    <div className="mt-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
                      <p className="text-xs font-semibold text-amber-800">Update note</p>
                      <p className="text-sm text-amber-900 mt-0.5">{event.updateNote}</p>
                    </div>
                  )}
                  {event.type === 'metadata_update' && (
                    <p className="mt-2 text-xs text-blue-700 bg-blue-50 rounded px-2 py-1 inline-block">
                      Metadata or content was updated — awaiting admin review
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
