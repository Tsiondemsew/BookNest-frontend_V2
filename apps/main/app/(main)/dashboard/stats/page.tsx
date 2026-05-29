'use client';

import { useQuery } from '@tanstack/react-query';
import { gamificationApi } from '@/lib/api/client';
import { Loader2, Flame, BookOpen, Clock } from 'lucide-react';

export default function ReadingStatsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['gamification', 'me'],
    queryFn: () => gamificationApi.getMe(),
  });

  const profile = data?.data;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-[#B85C38]" size={40} />
      </div>
    );
  }

  if (isError || !profile) {
    return <p className="text-red-500 p-6">Failed to load reading stats.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-[#1A2A3A]">Reading Stats</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E8E2D9] rounded-xl p-5">
          <Flame className="text-[#B85C38] mb-2" />
          <p className="text-3xl font-bold">{profile.streak.current}</p>
          <p className="text-sm text-[#4A5568]">Day streak</p>
          <p className="text-xs text-[#4A5568] mt-1">Best: {profile.streak.longest} days</p>
        </div>
        <div className="bg-white border border-[#E8E2D9] rounded-xl p-5">
          <BookOpen className="text-[#2C3E50] mb-2" />
          <p className="text-3xl font-bold">{profile.total_books_completed}</p>
          <p className="text-sm text-[#4A5568]">Books completed</p>
        </div>
        <div className="bg-white border border-[#E8E2D9] rounded-xl p-5">
          <Clock className="text-[#8E735B] mb-2" />
          <p className="text-3xl font-bold">{profile.today.minutes_read}</p>
          <p className="text-sm text-[#4A5568]">Minutes today</p>
          <p className="text-xs text-[#4A5568]">{profile.today.pages_read} pages today</p>
        </div>
      </div>

      <p className="text-sm text-[#4A5568]">
        Keep your streak alive by reading at least a little each day. Progress syncs when you are back online.
      </p>
    </div>
  );
}
