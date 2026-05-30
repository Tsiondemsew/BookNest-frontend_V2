import type { GamificationProfile } from '@repo/types';

const GAMIFICATION_CACHE_KEY = 'booknest:gamification_cache';

export function saveGamificationCache(profile: GamificationProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      GAMIFICATION_CACHE_KEY,
      JSON.stringify({ savedAt: new Date().toISOString(), profile })
    );
  } catch {
    /* ignore */
  }
}

export function clearGamificationCache(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(GAMIFICATION_CACHE_KEY);
  } catch {
    /* ignore */
  }
}

export function getGamificationCache(): GamificationProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(GAMIFICATION_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { profile?: GamificationProfile };
    return parsed.profile ?? null;
  } catch {
    return null;
  }
}
