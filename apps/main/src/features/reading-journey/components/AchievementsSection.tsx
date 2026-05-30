'use client';

import type { AchievementDefinition, GamificationProfile, UserAchievement } from '@repo/types';
import { Award, Lock, Sparkles, Target } from 'lucide-react';
import { getNextMilestones } from '../utils/achievementProgress';

interface AchievementsSectionProps {
  profile: GamificationProfile;
  achievements: UserAchievement[];
}

export function AchievementsSection({ profile, achievements }: AchievementsSectionProps) {
  const earnedIds = new Set(achievements.map((item) => item.achievement_id));
  const definitions = profile.achievement_definitions || [];
  const earnedCount = definitions.filter((def) => earnedIds.has(def.id)).length;
  const nextMilestones = getNextMilestones(profile, earnedIds);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E8E2D9] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="font-semibold text-[#1A2A3A] flex items-center gap-2">
              <Sparkles size={18} className="text-[#B85C38]" />
              Achievement progress
            </h3>
            <p className="text-sm text-[#4A5568] mt-1">
              {earnedCount} of {definitions.length} unlocked
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 sm:w-40 h-2.5 bg-[#F5F1EB] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#B85C38] to-[#D4845C] rounded-full transition-all duration-700"
                style={{
                  width: `${definitions.length ? (earnedCount / definitions.length) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="text-sm font-semibold text-[#1A2A3A] tabular-nums">
              {definitions.length ? Math.round((earnedCount / definitions.length) * 100) : 0}%
            </span>
          </div>
        </div>

        {nextMilestones.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nextMilestones.map((milestone) => {
              const pct = Math.min(100, Math.round((milestone.current / milestone.target) * 100));
              return (
                <div key={milestone.id} className="rounded-xl bg-[#FDFBF7] border border-[#E8E2D9] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#1A2A3A] flex items-center gap-1.5">
                      <Target size={14} className="text-[#8E735B]" />
                      {milestone.label}
                    </span>
                    <span className="text-xs text-[#4A5568] tabular-nums">
                      {milestone.current}/{milestone.target} {milestone.unit}
                    </span>
                  </div>
                  <div className="h-2 bg-[#E8E2D9] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2C3E50] rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-[#4A5568]">You have unlocked every milestone. Keep reading!</p>
        )}
      </div>

      <div>
        <h3 className="font-semibold text-[#1A2A3A] mb-4 flex items-center gap-2">
          <Award size={18} className="text-[#B85C38]" />
          All achievements
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {definitions.map((def) => (
            <AchievementCard
              key={def.id}
              definition={def}
              earned={earnedIds.has(def.id)}
              earnedAt={achievements.find((item) => item.achievement_id === def.id)?.earned_at}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function AchievementCard({
  definition,
  earned,
  earnedAt,
}: {
  definition: AchievementDefinition;
  earned: boolean;
  earnedAt?: string;
}) {
  return (
    <div
      className={`relative rounded-2xl border p-5 transition-all ${
        earned
          ? 'bg-gradient-to-br from-white to-[#FFF8F3] border-[#B85C38]/25 shadow-sm'
          : 'bg-[#F5F1EB]/60 border-[#E8E2D9]'
      }`}
    >
      <div className="flex gap-4">
        <div
          className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
            earned ? 'bg-[#B85C38]/15' : 'bg-[#E8E2D9]/80'
          }`}
        >
          {earned ? (
            <Award className="text-[#B85C38]" size={24} />
          ) : (
            <Lock className="text-[#4A5568]" size={22} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className={`font-semibold ${earned ? 'text-[#1A2A3A]' : 'text-[#4A5568]'}`}>
            {definition.title}
          </h4>
          <p className="text-sm text-[#4A5568] mt-1 leading-snug">{definition.description}</p>
          {earned && earnedAt && (
            <p className="text-xs text-[#2D6A4F] mt-2 font-medium">
              Unlocked {new Date(earnedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
            </p>
          )}
        </div>
      </div>
      {earned && (
        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#B85C38] animate-pulse" />
      )}
    </div>
  );
}
