import React, { useState, useEffect } from 'react';
import { db } from '../../lib/dexie';
import { aiService } from '../../services/ai.service';
import { useUIStore } from '../../stores/ui.store';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import type { WeakSpot } from '../../types/ai.types';
import { Sparkles, AlertTriangle, Lightbulb, CheckCircle2 } from 'lucide-react';

export const WeakSpotList: React.FC = () => {
  const { addToast } = useUIStore();
  
  const [hasFailedCards, setHasFailedCards] = useState(false);
  const [failedCount, setFailedCount] = useState(0);
  const [weakSpots, setWeakSpots] = useState<WeakSpot[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user has failed cards on mount
  useEffect(() => {
    const checkFailedCards = async () => {
      const failed = await db.card_reviews.filter((r) => r.rating <= 2).toArray();
      setHasFailedCards(failed.length > 0);
      setFailedCount(failed.length);
    };
    checkFailedCards();
  }, []);

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      addToast('Analyzing failed card reviews...', 'info');
      
      // 1. Fetch last 30 failed card reviews
      const failedReviews = await db.card_reviews
        .filter((r) => r.rating <= 2)
        .reverse()
        .limit(30)
        .toArray();

      // 2. Fetch associated card details
      const failedCardsList = [];
      for (const rev of failedReviews) {
        const card = await db.cards.get(rev.card_id);
        if (card) {
          failedCardsList.push({
            question: card.question,
            answer: card.answer
          });
        }
      }

      if (failedCardsList.length === 0) {
        addToast('No failed reviews available to analyze.', 'warning');
        setIsLoading(false);
        return;
      }

      // 3. Call AI service
      const analysis = await aiService.suggestWeakSpots(failedCardsList);
      setWeakSpots(analysis.gaps);
      addToast('Analysis complete!', 'success');
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to analyze weak spots.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-305">
            AI Weak Spot Insights
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Pinpoint your conceptual mistakes and study exactly what you need.
          </p>
        </div>

        <Button
          onClick={handleAnalyze}
          disabled={!hasFailedCards || isLoading}
          className="gap-1.5 self-start sm:self-center bg-violet-650 hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-750 text-white"
          size="sm"
        >
          <Sparkles className="w-4 h-4 text-amber-400 fill-current animate-pulse" />
          Analyze My Weak Spots ({failedCount})
        </Button>
      </div>

      {isLoading ? (
        /* Skeletons */
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      ) : weakSpots.length > 0 ? (
        /* Results list */
        <div className="grid grid-cols-1 gap-4">
          {weakSpots.map((spot, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-5 rounded-2xl border border-rose-100 dark:border-rose-950/20 bg-rose-50/20 dark:bg-rose-950/5 hover:bg-rose-50/30 dark:hover:bg-rose-950/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1.5 min-w-0">
                <h5 className="font-bold text-sm text-gray-900 dark:text-gray-50">
                  {spot.topic}
                </h5>
                <p className="text-xs text-gray-650 dark:text-gray-450 leading-relaxed pr-2">
                  {spot.description}
                </p>
                <div className="flex items-start gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold pt-1">
                  <Lightbulb className="w-3.5 h-3.5 mt-0.5 text-amber-500 fill-amber-500/10" />
                  <span>Recommendation: {spot.recommendation}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Default empty / success state */
        <div className="flex flex-col items-center justify-center border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-10 text-center">
          {!hasFailedCards ? (
            <>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-3">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h5 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-0.5">No Mistakes Yet!</h5>
              <p className="text-xs text-gray-550 dark:text-gray-400 max-w-xs">
                Perfect score! Study more cards and fail some reviews to trigger weak spot reports.
              </p>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500 mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h5 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-0.5">Ready for Analysis</h5>
              <p className="text-xs text-gray-550 dark:text-gray-400 max-w-xs mb-4">
                You have {failedCount} failed reviews. Tap the analyze button to dissect your knowledge gaps.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};
