'use client';

import { useQuery } from '@tanstack/react-query';
import { gamificationApi } from '@/lib/api/client';
import { Loader2, Award, Lock } from 'lucide-react';

export default function AchievementsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['gamification', 'me'],
    queryFn: () => gamificationApi.getMe(),
  });

  const profile = data?.data;
  const earnedIds = new Set((profile?.achievements || []).map((a) => a.achievement_id));

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-[#B85C38]" size={40} />
      </div>
    );
  }

  if (isError || !profile) {
    return <p className="text-red-500 p-6">Failed to load achievements.</p>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[#1A2A3A] mb-6">Achievements</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(profile.achievement_definitions || []).map((def) => {
          const earned = earnedIds.has(def.id);
          return (
            <div
              key={def.id}
              className={`rounded-xl border p-4 flex gap-3 ${
                earned ? 'bg-white border-[#B85C38]/30' : 'bg-[#F5F1EB] border-[#E8E2D9] opacity-80'
              }`}
            >
              <div className="p-2 rounded-lg bg-[#B85C38]/10">
                {earned ? (
                  <Award className="text-[#B85C38]" size={24} />
                ) : (
                  <Lock className="text-[#4A5568]" size={24} />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-[#1A2A3A]">{def.title}</h3>
                <p className="text-sm text-[#4A5568]">{def.description}</p>
                {earned && (
                  <p className="text-xs text-green-600 mt-1">
                    Earned{' '}
                    {new Date(
                      profile.achievements.find((a) => a.achievement_id === def.id)?.earned_at || ''
                    ).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
