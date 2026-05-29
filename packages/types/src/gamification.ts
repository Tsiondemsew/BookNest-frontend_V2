export interface GamificationStreak {
  current: number;
  longest: number;
  last_read_date: string | null;
}

export interface GamificationToday {
  pages_read: number;
  minutes_read: number;
  books_active: number;
}

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: string | null;
}

export interface UserAchievement {
  achievement_id: string;
  earned_at: string;
  achievement?: AchievementDefinition;
}

export interface GamificationProfile {
  streak: GamificationStreak;
  today: GamificationToday;
  total_books_completed: number;
  achievements: UserAchievement[];
  achievement_definitions: AchievementDefinition[];
}

export interface GamificationResponse {
  success: boolean;
  data: GamificationProfile;
}
