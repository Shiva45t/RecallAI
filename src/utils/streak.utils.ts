import { isSameDay, isYesterday } from './date.utils';

interface StreakResult {
  streakCount: number;
  lastStudiedAt: string;
}

/**
 * Calculates the updated study streak based on last study date
 * 
 * @param lastStudiedAtString ISO string of last study date (null if never studied)
 * @param currentStreak current streak count
 * @returns updated streak count and new lastStudiedAt string
 */
export function calculateStreak(
  lastStudiedAtString: string | null,
  currentStreak: number
): StreakResult {
  const now = new Date();
  const nowISO = now.toISOString();

  if (!lastStudiedAtString) {
    return {
      streakCount: 1,
      lastStudiedAt: nowISO
    };
  }

  const lastStudiedDate = new Date(lastStudiedAtString);

  if (isSameDay(lastStudiedDate, now)) {
    // Already studied today, keep current streak
    return {
      streakCount: Math.max(1, currentStreak),
      lastStudiedAt: nowISO
    };
  }

  if (isYesterday(lastStudiedDate)) {
    // Studied yesterday, increment streak
    return {
      streakCount: currentStreak + 1,
      lastStudiedAt: nowISO
    };
  }

  // Streak broken, reset to 1
  return {
    streakCount: 1,
    lastStudiedAt: nowISO
  };
}
