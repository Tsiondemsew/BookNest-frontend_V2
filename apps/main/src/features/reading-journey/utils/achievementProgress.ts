import type { GamificationProfile } from '@repo/types';

export interface MilestoneProgress {
  id: string;
  label: string;
  current: number;
  target: number;
  unit: string;
}

const MILESTONES: Array<{
  id: string;
  label: string;
  target: number;
  unit: string;
  getValue: (profile: GamificationProfile) => number;
}> = [
  {
    id: 'first_book',
    label: 'First book finished',
    target: 1,
    unit: 'books',
    getValue: (p) => p.total_books_completed,
  },
  {
    id: 'streak_3',
    label: '3-day streak',
    target: 3,
    unit: 'days',
    getValue: (p) => p.streak.current,
  },
  {
    id: 'streak_7',
    label: '7-day streak',
    target: 7,
    unit: 'days',
    getValue: (p) => p.streak.current,
  },
  {
    id: 'books_5',
    label: '5 books finished',
    target: 5,
    unit: 'books',
    getValue: (p) => p.total_books_completed,
  },
  {
    id: 'pages_10',
    label: '10 pages lifetime',
    target: 10,
    unit: 'pages',
    getValue: (p) => p.lifetime?.total_pages ?? 0,
  },
  {
    id: 'pages_100',
    label: '100 pages lifetime',
    target: 100,
    unit: 'pages',
    getValue: (p) => p.lifetime?.total_pages ?? 0,
  },
  {
    id: 'pages_500',
    label: '500 pages lifetime',
    target: 500,
    unit: 'pages',
    getValue: (p) => p.lifetime?.total_pages ?? 0,
  },
  {
    id: 'minutes_15',
    label: '15 minutes listened',
    target: 15,
    unit: 'min',
    getValue: (p) => p.lifetime?.total_minutes ?? 0,
  },
  {
    id: 'minutes_60',
    label: '60 minutes listened',
    target: 60,
    unit: 'min',
    getValue: (p) => p.lifetime?.total_minutes ?? 0,
  },
];

export function getNextMilestones(
  profile: GamificationProfile,
  earnedIds: Set<string>,
  limit = 4
): MilestoneProgress[] {
  return MILESTONES.filter((m) => !earnedIds.has(m.id))
    .map((m) => ({
      id: m.id,
      label: m.label,
      current: m.getValue(profile),
      target: m.target,
      unit: m.unit,
    }))
    .filter((m) => m.current < m.target)
    .slice(0, limit);
}

export function formatWeekday(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString(undefined, { weekday: 'short' });
}

export function formatShortDate(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
