'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  Clock,
  Flame,
  Library,
  Loader2,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { gamificationApi } from '@/lib/api/client';
import { saveGamificationCache, getGamificationCache } from '@/lib/offline/gamificationCache';
import { onReadingActivityRecorded } from '@/lib/reading/recordActivity';
import { OfflinePageNotice } from '@/components/OfflinePageNotice';
import { ActivitySyncBanner } from '@/components/ActivitySyncBanner';
import { StreakPushPrompt } from '@/components/StreakPushPrompt';
import type { DailyReadingActivity, GamificationProfile } from '@repo/types';
import { WeeklyActivityChart } from './WeeklyActivityChart';
import { AchievementsSection } from './AchievementsSection';

const EMPTY_WEEK: DailyReadingActivity[] = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(Date.now() - (6 - i) * 86400000);
  return { date: d.toISOString().slice(0, 10), pages_read: 0, minutes_read: 0 };
});

function normalizeProfile(profile: GamificationProfile): GamificationProfile {
  return {
    ...profile,
    lifetime: profile.lifetime ?? { total_pages: 0, total_minutes: 0 },
    weekly_activity:
      profile.weekly_activity?.length === 7 ? profile.weekly_activity : EMPTY_WEEK,
  };
}

export function ReadingJourneyView() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['gamification', 'me'],
    queryFn: async () => {
      const res = await gamificationApi.getMe();
      if (res.data) saveGamificationCache(res.data);
      return res;
    },
    placeholderData: () => {
      const cached = getGamificationCache();
      return cached ? { success: true, data: cached } : undefined;
    },
    refetchOnWindowFocus: () =>
      typeof navigator !== 'undefined' && navigator.onLine,
    staleTime: 30_000,
    networkMode: 'offlineFirst',
    retry: (count) => navigator.onLine && count < 2,
  });

  const cachedProfile = getGamificationCache();
  const showStale = Boolean(isError && cachedProfile);
  const profileData = data?.data ?? (showStale ? cachedProfile : null);

  useEffect(() => {
    const unsubscribe = onReadingActivityRecorded(() => {
      void queryClient.invalidateQueries({ queryKey: ['gamification', 'me'] });
    });
    return unsubscribe;
  }, [queryClient]);

  useEffect(() => {
    const onFocus = () => void refetch();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refetch]);

  if (isLoading && !profileData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="animate-spin text-[#B85C38]" size={36} />
        <p className="text-sm text-[#4A5568]">Loading your stats…</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4 space-y-4">
        <p className="text-red-600 font-medium">Could not load reading data.</p>
        <p className="text-sm text-[#4A5568]">
          {navigator.onLine
            ? 'Something went wrong on our end. Please try again.'
            : 'Check your connection and try again.'}
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#B85C38] text-white text-sm font-semibold disabled:opacity-60 hover:bg-[#A04E2F] transition-colors"
        >
          {isFetching ? <Loader2 size={16} className="animate-spin" /> : null}
          Retry
        </button>
      </div>
    );
  }

  const profile = normalizeProfile(profileData);
  const streak = profile.streak.current;
  const lifetimePages = profile.lifetime.total_pages;
  const lifetimeMinutes = profile.lifetime.total_minutes;
  const readToday = profile.today.pages_read > 0 || profile.today.minutes_read > 0;
  const streakMessage =
    streak >= 30
      ? 'Legendary consistency — keep it up!'
      : streak >= 7
        ? 'A full week strong. Keep the momentum!'
        : streak >= 1
          ? readToday
            ? 'Streak extended today.'
            : 'Read today to keep your streak alive.'
          : 'Read a page today to start your streak.';

  return (
    <div className="space-y-6 sm:space-y-8">
      <OfflinePageNotice label="stats may be from your last online session" />
      {showStale && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex flex-col sm:flex-row sm:items-center gap-3">
          <span>Showing last saved stats — live sync failed.</span>
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-white border border-amber-200 font-medium hover:bg-amber-50/80 transition-colors"
          >
            {isFetching ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      )}
      <ActivitySyncBanner />

      {/* Streak hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2C3E50] via-[#1A2A3A] to-[#2C3E50] text-white p-6 sm:p-8">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-[#B85C38]/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 bottom-0 w-48 h-48 rounded-full bg-[#B85C38]/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-bold leading-tight bn-serif">
              {streak > 0 ? (
                <>
                  <Flame className="inline-block text-[#FF8C42] mb-1 mr-2" size={28} />
                  {streak}-day streak
                </>
              ) : (
                'Start your streak'
              )}
            </h2>
            <p className="text-white/75">{streakMessage}</p>
            <p className="text-white/90 text-sm font-medium">
              {lifetimePages} {lifetimePages === 1 ? 'page' : 'pages'} read · {lifetimeMinutes}{' '}
              {lifetimeMinutes === 1 ? 'minute' : 'minutes'} listened
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                href="/library"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#B85C38] hover:bg-[#A04E2F] text-white text-sm font-semibold transition-colors"
              >
                <Library size={16} />
                Open library
              </Link>
              {profile.today.pages_read === 0 && profile.today.minutes_read === 0 && (
                <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 text-white/90 text-sm">
                  <Zap size={16} />
                  Read or listen today
                </span>
              )}
              <StreakPushPrompt streak={streak} compact />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:min-w-[260px]">
            <HeroStat label="Best streak" value={profile.streak.longest} suffix="days" />
            <HeroStat label="Books done" value={profile.total_books_completed} />
            <HeroStat label="Pages today" value={profile.today.pages_read} />
            <HeroStat label="Minutes today" value={profile.today.minutes_read} suffix="min" />
          </div>
        </div>
      </section>

      {/* Summary cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={Flame}
          label="Current streak"
          value={profile.streak.current}
          sub={`Best ${profile.streak.longest} days`}
          color="#B85C38"
        />
        <StatCard
          icon={BookOpen}
          label="Books completed"
          value={profile.total_books_completed}
          sub="All time"
          color="#2C3E50"
        />
        <StatCard
          icon={TrendingUp}
          label="Total pages"
          value={profile.lifetime.total_pages}
          sub="Lifetime"
          color="#2D6A4F"
        />
        <StatCard
          icon={Clock}
          label="Listening time"
          value={profile.lifetime.total_minutes}
          sub="Minutes (lifetime)"
          color="#8E735B"
        />
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <WeeklyActivityChart
          data={profile.weekly_activity}
          metric="pages"
          title="Pages per day"
          accentColor="#B85C38"
        />
        <WeeklyActivityChart
          data={profile.weekly_activity}
          metric="minutes"
          title="Listening & reading minutes"
          accentColor="#2C3E50"
        />
      </section>

      <AchievementsSection profile={profile} achievements={profile.achievements} />

      <p className="text-center text-xs text-[#4A5568] pb-2">
        Streaks count new pages or 20+ seconds of listening per day.
      </p>
    </div>
  );
}

function HeroStat({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 px-3 py-2.5 sm:px-4 sm:py-3">
      <p className="text-xl sm:text-2xl font-bold tabular-nums">
        {value}
        {suffix ? <span className="text-xs sm:text-sm font-normal text-white/70 ml-1">{suffix}</span> : null}
      </p>
      <p className="text-xs text-white/65 mt-0.5">{label}</p>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: typeof Flame;
  label: string;
  value: number;
  sub: string;
  color: string;
}) {
  return (
    <div className="bg-white border border-[#E8E2D9] rounded-xl p-4 shadow-sm">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center mb-2.5"
        style={{ backgroundColor: `${color}12` }}
      >
        <Icon size={18} style={{ color }} />
      </div>
      <p className="text-xl sm:text-2xl font-bold text-[#1A2A3A] tabular-nums">{value}</p>
      <p className="text-sm font-medium text-[#1A2A3A] mt-0.5">{label}</p>
      <p className="text-xs text-[#4A5568]">{sub}</p>
    </div>
  );
}
