import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/auth.store';
import { db } from '../lib/dexie';
import { HeatmapCalendar } from '../components/analytics/HeatmapCalendar';
import { ProgressChart } from '../components/analytics/ProgressChart';
import { WeakSpotList } from '../components/analytics/WeakSpotList';
import type { Card } from '../types/card.types';
import {
  Flame,
  Brain,
  Award,
  AlertTriangle
} from 'lucide-react';

interface ChartDataPoint {
  date: string;
  accuracy: number;
}

interface WeakCardDetail {
  card: Card;
  failCount: number;
}

export const Analytics: React.FC = () => {
  const { user, profile } = useAuthStore();

  const [heatmapData, setHeatmapData] = useState<Record<string, number>>({});
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [masteredCount, setMasteredCount] = useState(0);
  const [topWeakCards, setTopWeakCards] = useState<WeakCardDetail[]>([]);


  const fetchAnalytics = async () => {
    if (!user) return;
    try {

      // 1. Heatmap Data (last 90 days study sessions)
      const sessions = await db.study_sessions
        .where('user_id')
        .equals(user.id)
        .toArray();

      const heatmap: Record<string, number> = {};
      sessions.forEach((s) => {
        const dateStr = s.completed_at.split('T')[0];
        heatmap[dateStr] = (heatmap[dateStr] || 0) + s.cards_studied;
      });
      setHeatmapData(heatmap);

      // 2. Accuracy Trend Data (last 14 days accuracy rate)
      const chartPoints: ChartDataPoint[] = [];
      for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dStr = d.toISOString().split('T')[0];

        // Filter sessions on this day
        const daySessions = sessions.filter((s) => s.completed_at.startsWith(dStr));

        if (daySessions.length > 0) {
          const totalStudied = daySessions.reduce((acc, s) => acc + s.cards_studied, 0);
          const totalCorrect = daySessions.reduce((acc, s) => acc + s.cards_correct, 0);
          const accuracy = totalStudied > 0 ? Math.round((totalCorrect / totalStudied) * 100) : 100;
          chartPoints.push({ date: dStr, accuracy });
        } else {
          // If no sessions, look back at the last recorded accuracy or show nothing
          // For graph continuity, we can omit dates with no study sessions from chart
        }
      }
      setChartData(chartPoints);

      // 3. Mastered Cards Count (repetitions >= 3)
      const mastered = await db.cards
        .where('user_id')
        .equals(user.id)
        .filter((c) => c.repetitions >= 3)
        .count();
      setMasteredCount(mastered);

      // 4. Top Weak Cards (reviews with rating <= 2)
      const reviews = await db.card_reviews
        .where('user_id')
        .equals(user.id)
        .filter((r) => r.rating <= 2)
        .toArray();

      const counts: Record<string, number> = {};
      reviews.forEach((r) => {
        counts[r.card_id] = (counts[r.card_id] || 0) + 1;
      });

      const sortedWeak = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

      const weakDetails: WeakCardDetail[] = [];
      for (const [cardId, failCount] of sortedWeak) {
        const card = await db.cards.get(cardId);
        if (card) {
          weakDetails.push({ card, failCount });
        }
      }
      setTopWeakCards(weakDetails);
    } catch (err) {
      console.error('Failed to compile study analytics:', err);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [user]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
          Learning Analytics
        </h1>
        <p className="text-sm text-gray-550 dark:text-gray-400 mt-1">
          Detailed metrics of your spaced repetition progression and AI learning insights.
        </p>
      </div>

      {/* Grid of Highlight Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Streak */}
        <div className="neo-glass-card-static p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Flame className="w-6 h-6 fill-current animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Study Streak
            </span>
            <span className="text-xl font-bold text-gray-950 dark:text-gray-50 font-mono">
              {profile?.streak_count || 0} days
            </span>
          </div>
        </div>

        {/* Total Studied */}
        <div className="neo-glass-card-static p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Cards Studied
            </span>
            <span className="text-xl font-bold text-gray-950 dark:text-gray-50 font-mono">
              {profile?.total_cards_studied || 0} reviews
            </span>
          </div>
        </div>

        {/* Mastered Cards */}
        <div className="neo-glass-card-static p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Mastered Cards
            </span>
            <span className="text-xl font-bold text-gray-950 dark:text-gray-50 font-mono">
              {masteredCount} cards
            </span>
          </div>
        </div>
      </div>

      {/* Heatmap Activity */}
      <div className="neo-glass-card-static p-6">
        <HeatmapCalendar data={heatmapData} />
      </div>

      {/* Grid: Recharts graph & Weak Spot list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="neo-glass-card-static p-6">
          <ProgressChart data={chartData} />
        </div>

        {/* AI Weak Spot list */}
        <div className="neo-glass-card-static p-6">
          <WeakSpotList />
        </div>
      </div>

      {/* Top Weak Cards lists */}
      <div className="neo-glass-card-static p-6 space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-305 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-500" /> Toughest Cards (Most Mistakes)
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            These individual flashcards have been missed the most times during study sessions.
          </p>
        </div>

        {topWeakCards.length === 0 ? (
          <div className="text-center py-6 text-xs text-gray-500">
            No failed card reviews logged yet. Great memory!
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {topWeakCards.map(({ card, failCount }) => (
              <div key={card.id} className="py-3.5 flex items-start justify-between gap-4 first:pt-0 last:pb-0">
                <div className="space-y-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-50 line-clamp-1 pr-2">
                    {card.question}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 italic">
                    "{card.answer}"
                  </p>
                </div>
                <span className="text-[10px] font-bold bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50 px-2.5 py-1 rounded-full flex-shrink-0">
                  Missed: {failCount}x
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
