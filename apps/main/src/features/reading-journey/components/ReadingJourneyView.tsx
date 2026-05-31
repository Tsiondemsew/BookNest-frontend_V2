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
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="animate-spin text-[#B85C38]" size={40} />
        <p className="text-sm text-[#4A5568]">Loading your reading journey…</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 px-4 space-y-4">
        <p className="text-red-600 font-medium">Could not load reading data.</p>
        <p className="text-sm text-[#4A5568]">
          {navigator.onLine
            ? 'The server may be missing database permissions. Run migration 20260603_grant_daily_reading_stats.sql in Supabase, then retry.'
            : 'Check your connection and try again.'}
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#B85C38] text-white text-sm font-semibold disabled:opacity-60"
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
      ? 'Legendary consistency — you are on fire!'
      : streak >= 7
        ? 'A full week strong. Keep the momentum!'
        : streak >= 1
          ? readToday
            ? 'Streak extended today — keep it going!'
            : 'Your streak is still alive. Read today so you don’t lose it.'
          : 'Start a streak — read a page today.';

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <OfflinePageNotice label="reading stats may be from your last online session" />
      {showStale && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex flex-col sm:flex-row sm:items-center gap-3">
          <span>Showing last saved stats — live sync failed. Pending listening time will apply when the server is reachable.</span>
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-white border border-amber-200 font-medium"
          >
            {isFetching ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      )}
      <ActivitySyncBanner />

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2C3E50] via-[#1A2A3A] to-[#2C3E50] text-white p-8 md:p-10">
        <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-[#B85C38]/20 blur-3xl" />
        <div className="absolute -left-12 bottom-0 w-56 h-56 rounded-full bg-[#B85C38]/10 blur-3xl" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <p className="text-[#D4845C] text-sm font-semibold uppercase tracking-wider">
              Reading Journey
            </p>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">
              {streak > 0 ? (
                <>
                  <Flame className="inline-block text-[#FF8C42] mb-1 mr-2" size={36} />
                  {streak}-day streak
                </>
              ) : (
                'Begin your reading streak'
              )}
            </h1>
            <p className="text-white/75 text-lg">{streakMessage}</p>
            <p className="text-white/90 text-base font-medium">
              {lifetimePages} {lifetimePages === 1 ? 'page' : 'pages'} read · {lifetimeMinutes}{' '}
              {lifetimeMinutes === 1 ? 'minute' : 'minutes'} listened
              <span className="text-white/60 font-normal text-sm ml-1">(lifetime totals)</span>
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/library"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B85C38] hover:bg-[#A04E2F] text-white text-sm font-semibold transition-colors"
              >
                <Library size={16} />
                Open library
              </Link>
              {profile.today.pages_read === 0 && profile.today.minutes_read === 0 && (
                <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white/90 text-sm">
                  <Zap size={16} />
                  Read or listen today to keep your streak
                </span>
              )}
              <StreakPushPrompt streak={streak} compact />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:min-w-[280px]">
            <HeroStat label="Best streak" value={profile.streak.longest} suffix="days" />
            <HeroStat label="Books done" value={profile.total_books_completed} />
            <HeroStat label="Pages today" value={profile.today.pages_read} />
            <HeroStat label="Listen/read today" value={profile.today.minutes_read} suffix="min" />
          </div>
        </div>
      </section>

      {/* Summary cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
          sub="Lifetime total"
          color="#2D6A4F"
        />
        <StatCard
          icon={Clock}
          label="Listening time"
          value={profile.lifetime.total_minutes}
          sub="Minutes listened (lifetime)"
          color="#8E735B"
        />
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

      {/* Achievements */}
      <AchievementsSection profile={profile} achievements={profile.achievements} />

      <p className="text-center text-sm text-[#4A5568] pb-4">
        Daily stats count new pages (forward in the book) and listening time while audio plays.
        Streaks need at least 1 new page or 20+ seconds listened — opening a book alone does not count.
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
    <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-3">
      <p className="text-2xl font-bold tabular-nums">
        {value}
        {suffix ? <span className="text-sm font-normal text-white/70 ml-1">{suffix}</span> : null}
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
    <div className="bg-white border border-[#E8E2D9] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
        style={{ backgroundColor: `${color}12` }}
      >
        <Icon size={20} style={{ color }} />
      </div>
      <p className="text-2xl font-bold text-[#1A2A3A] tabular-nums">{value}</p>
      <p className="text-sm font-medium text-[#1A2A3A] mt-0.5">{label}</p>
      <p className="text-xs text-[#4A5568]">{sub}</p>
    </div>
  );
}
