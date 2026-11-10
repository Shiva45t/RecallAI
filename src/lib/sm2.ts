export interface SM2Input {
  easeFactor: number;
  interval: number;
  repetitions: number;
  rating: number; // 1 to 5
}

export interface SM2Output {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewAt: string; // ISO String
}

/**
 * SuperMemo SM-2 Spaced Repetition Algorithm
 * 
 * Input:
 * - easeFactor: float (default 2.5)
 * - interval: integer in days (default 1)
 * - repetitions: integer count (default 0)
 * - rating: integer between 1 and 5 (1 = Again/Forget, 2 = Hard, 4 = Good, 5 = Easy)
 * 
 * Output:
 * - easeFactor: updated factor (min 1.3)
 * - interval: next interval in days
 * - repetitions: updated consecutive successful repetitions
 * - nextReviewAt: ISO string representing next review date/time
 */
export function calculateSM2({ easeFactor, interval, repetitions, rating }: SM2Input): SM2Output {
  let nextRepetitions = repetitions;
  let nextInterval = interval;

  if (rating < 3) {
    // Forgot or struggled with the card; reset interval
    nextRepetitions = 0;
    nextInterval = 1;
  } else {
    if (repetitions === 0) {
      nextInterval = 1;
    } else if (repetitions === 1) {
      nextInterval = 6;
    } else {
      nextInterval = Math.round(interval * easeFactor);
    }
    nextRepetitions = repetitions + 1;
  }

  // Calculate new Ease Factor
  // Formula: easeFactor = max(1.3, easeFactor + 0.1 - (5-rating)*(0.08 + (5-rating)*0.02))
  const factorAdjustment = 0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02);
  const nextEaseFactor = Math.max(1.3, easeFactor + factorAdjustment);

  // Calculate next review timestamp
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + nextInterval);

  return {
    easeFactor: parseFloat(nextEaseFactor.toFixed(2)),
    interval: nextInterval,
    repetitions: nextRepetitions,
    nextReviewAt: nextReviewDate.toISOString(),
  };
}
