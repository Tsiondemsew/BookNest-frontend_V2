'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
  progress?: number;
  maxProgress?: number;
  points: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
}

interface Leaderboard {
  rank: number;
  name: string;
  points: number;
  level: number;
  avatar: string;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: '1',
    name: 'Bookworm',
    description: 'Read 10 books',
    icon: '📚',
    unlocked: true,
    unlockedDate: '2024-01-15',
    points: 100,
    rarity: 'common',
  },
  {
    id: '2',
    name: 'Speed Reader',
    description: 'Read a book in one day',
    icon: '⚡',
    unlocked: true,
    unlockedDate: '2024-02-20',
    points: 150,
    rarity: 'uncommon',
  },
  {
    id: '3',
    name: 'Genre Master',
    description: 'Read 5 books from 5 different genres',
    icon: '🎭',
    unlocked: true,
    unlockedDate: '2024-03-10',
    points: 200,
    rarity: 'uncommon',
  },
  {
    id: '4',
    name: 'Social Butterfly',
    description: 'Follow 50 readers',
    icon: '🦋',
    unlocked: true,
    unlockedDate: '2024-03-05',
    points: 75,
    rarity: 'common',
  },
  {
    id: '5',
    name: 'First Review',
    description: 'Write your first book review',
    icon: '⭐',
    unlocked: true,
    unlockedDate: '2024-01-25',
    points: 50,
    rarity: 'common',
  },
  {
    id: '6',
    name: 'Collector',
    description: 'Own 100 books',
    icon: '🏆',
    unlocked: true,
    unlockedDate: '2024-02-28',
    points: 250,
    rarity: 'rare',
  },
  {
    id: '7',
    name: 'Night Owl',
    description: 'Read 1000 pages',
    icon: '🌙',
    unlocked: false,
    progress: 750,
    maxProgress: 1000,
    points: 300,
    rarity: 'rare',
  },
  {
    id: '8',
    name: 'Legend',
    description: 'Reach level 50',
    icon: '👑',
    unlocked: false,
    progress: 45,
    maxProgress: 50,
    points: 500,
    rarity: 'legendary',
  },
  {
    id: '9',
    name: 'Marketplace Master',
    description: 'Buy and sell 50 books',
    icon: '💰',
    unlocked: false,
    progress: 23,
    maxProgress: 50,
    points: 200,
    rarity: 'uncommon',
  },
  {
    id: '10',
    name: 'Critic',
    description: 'Get 100 helpful votes on reviews',
    icon: '✏️',
    unlocked: false,
    progress: 42,
    maxProgress: 100,
    points: 150,
    rarity: 'uncommon',
  },
];

const LEADERBOARD: Leaderboard[] = [
  { rank: 1, name: 'Alex Reader', points: 4500, level: 48, avatar: '👨' },
  { rank: 2, name: 'Sarah Books', points: 4200, level: 45, avatar: '👩' },
  { rank: 3, name: 'Mike Literature', points: 3950, level: 43, avatar: '🧔' },
  { rank: 4, name: 'Emma Words', points: 3750, level: 42, avatar: '👩‍🦰' },
  { rank: 5, name: 'You', points: 3200, level: 38, avatar: '👤' },
];

const BADGES = [
  { tier: 'Bronze', minPoints: 0, color: 'text-amber-700', bgColor: 'bg-amber-100' },
  { tier: 'Silver', minPoints: 1000, color: 'text-gray-600', bgColor: 'bg-gray-100' },
  { tier: 'Gold', minPoints: 2500, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  { tier: 'Platinum', minPoints: 5000, color: 'text-blue-600', bgColor: 'bg-blue-100' },
];

export default function AchievementsPage() {
  const t = useTranslations();
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? 'en';
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [filterBy, setFilterBy] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [sortBy, setSortBy] = useState<'points' | 'rarity' | 'date'>('points');
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const userTotalPoints = 3200;
  const userLevel = 38;
  const userCurrentTierPoints = 2500;
  const userNextTierPoints = 5000;

  const filteredAchievements = ACHIEVEMENTS.filter((a) => {
    if (filterBy === 'unlocked') return a.unlocked;
    if (filterBy === 'locked') return !a.unlocked;
    return true;
  });

  const sortedAchievements = [...filteredAchievements].sort((a, b) => {
    if (sortBy === 'points') return b.points - a.points;
    if (sortBy === 'rarity') {
      const rarityOrder = { common: 0, uncommon: 1, rare: 2, legendary: 3 };
      return rarityOrder[b.rarity] - rarityOrder[a.rarity];
    }
    return (
      new Date(b.unlockedDate || '').getTime() - new Date(a.unlockedDate || '').getTime()
    );
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'text-gray-600';
      case 'uncommon':
        return 'text-green-600';
      case 'rare':
        return 'text-blue-600';
      case 'legendary':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const getCurrentTier = () => {
    for (let i = BADGES.length - 1; i >= 0; i--) {
      if (userTotalPoints >= BADGES[i].minPoints) {
        return BADGES[i];
      }
    }
    return BADGES[0];
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  const currentTier = getCurrentTier();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">BookNest Achievements</h1>
            <nav className="flex gap-4">
              <Link href={`/${locale}/dashboard`} className="text-gray-600 hover:text-gray-900">
                {t('nav.discover')}
              </Link>
              <Link href={`/${locale}/profile`} className="text-gray-600 hover:text-gray-900">
                {t('nav.profile')}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Stats */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Level */}
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600 mb-2">{userLevel}</div>
              <p className="text-gray-600 font-semibold">Current Level</p>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: '75%' }}
                ></div>
              </div>
            </div>

            {/* Total Points */}
            <div className="text-center">
              <div className="text-5xl font-bold text-green-600 mb-2">{userTotalPoints}</div>
              <p className="text-gray-600 font-semibold">Total Points</p>
              <p className="text-xs text-gray-500 mt-2">
                {userNextTierPoints - userTotalPoints} to Platinum
              </p>
            </div>

            {/* Current Tier */}
            <div className="text-center">
              <div className={`text-5xl font-bold ${currentTier.color} mb-2`}>
                {currentTier.tier === 'Bronze' && '🥉'}
                {currentTier.tier === 'Silver' && '🥈'}
                {currentTier.tier === 'Gold' && '🥇'}
                {currentTier.tier === 'Platinum' && '💎'}
              </div>
              <p className="text-gray-600 font-semibold">{currentTier.tier} Tier</p>
              <p className="text-xs text-gray-500 mt-2">
                {currentTier.minPoints.toLocaleString()} pts
              </p>
            </div>

            {/* Achievements */}
            <div className="text-center">
              <div className="text-5xl font-bold text-orange-600 mb-2">
                {ACHIEVEMENTS.filter((a) => a.unlocked).length}
              </div>
              <p className="text-gray-600 font-semibold">Achievements</p>
              <p className="text-xs text-gray-500 mt-2">
                {ACHIEVEMENTS.filter((a) => a.unlocked).length} / {ACHIEVEMENTS.length}
              </p>
            </div>
          </div>
        </div>

        {/* Controls and Leaderboard Toggle */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="flex gap-4 flex-wrap">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Achievements</option>
              <option value="unlocked">Unlocked</option>
              <option value="locked">Locked</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="points">Sort by Points</option>
              <option value="rarity">Sort by Rarity</option>
              <option value="date">Sort by Date</option>
            </select>
          </div>

          <button
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            {showLeaderboard ? 'Hide Leaderboard' : 'Show Leaderboard'}
          </button>
        </div>

        {/* Leaderboard */}
        {showLeaderboard && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Global Leaderboard</h2>
            <div className="space-y-3">
              {LEADERBOARD.map((entry) => (
                <div
                  key={entry.rank}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    entry.name === 'You' ? 'bg-blue-100 border-2 border-blue-600' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-gray-600 w-8">#{entry.rank}</div>
                    <div className="text-3xl">{entry.avatar}</div>
                    <div>
                      <p className="font-semibold text-gray-900">{entry.name}</p>
                      <p className="text-sm text-gray-600">Level {entry.level}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{entry.points.toLocaleString()}</p>
                    <p className="text-xs text-gray-600">points</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements Grid */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Achievement Collection</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`rounded-lg shadow-md p-6 transition ${
                achievement.unlocked ? 'bg-white' : 'bg-gray-100 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-5xl">{achievement.icon}</div>
                <div className="text-right">
                  <p className={`font-bold text-lg ${getRarityColor(achievement.rarity)}`}>
                    {achievement.points} pts
                  </p>
                  <p className={`text-xs font-semibold ${getRarityColor(achievement.rarity)}`}>
                    {achievement.rarity.toUpperCase()}
                  </p>
                </div>
              </div>

              <h3 className="font-bold text-lg text-gray-900 mb-1">{achievement.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{achievement.description}</p>

              {achievement.unlocked ? (
                <div className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full inline-block">
                  ✓ Unlocked {achievement.unlockedDate}
                </div>
              ) : (
                <>
                  <div className="w-full bg-gray-300 rounded-full h-2 mb-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${
                          ((achievement.progress || 0) / (achievement.maxProgress || 1)) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600">
                    {achievement.progress} / {achievement.maxProgress}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
