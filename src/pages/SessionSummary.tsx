import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import type { StudySession } from '../types/session.types';
import { db } from '../lib/dexie';
import type { Deck } from '../types/deck.types';
import { Button } from '../components/ui/Button';
import { formatDuration } from '../utils/format.utils';
import { Trophy, Clock, BookOpen, CheckCircle } from 'lucide-react';

export const SessionSummary: React.FC = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [deck, setDeck] = useState<Deck | null>(null);
  
  // Try retrieving state passed from Study page, fallback to null
  const session = location.state?.session as StudySession | undefined;

  useEffect(() => {
    if (deckId) {
      db.decks.get(deckId).then((data) => {
        if (data) setDeck(data);
      });
    }
  }, [deckId]);

  if (!session) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center p-6 bg-white dark:bg-darkSurface border rounded-2xl shadow-sm">
        <BookOpen className="w-10 h-10 text-gray-400 mb-2 animate-bounce" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">No Session Data Found</h2>
        <p className="text-sm text-gray-500 mt-1 mb-6">You haven't studied cards in this session yet.</p>
        <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
      </div>
    );
  }

  const accuracy = session.cards_studied > 0 
    ? Math.round((session.cards_correct / session.cards_studied) * 100)
    : 0;

  // Determine encouragement message based on accuracy
  const getEncouragement = () => {
    if (accuracy >= 90) return 'Incredible! You have nearly mastered this topic! 🌟';
    if (accuracy >= 75) return 'Great job! Strong recall score today. 👍';
    if (accuracy >= 50) return 'Good progress! Keep reviewing to reinforce these connections. 💪';
    return 'Learning is a process. Keep practicing to build confidence! 🧠';
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-darkSurface border border-gray-150 dark:border-gray-800 rounded-3xl p-8 shadow-xl space-y-8 relative overflow-hidden">
      {/* Decorative trophy glow */}
      <div className="absolute top-[-10%] left-[50%] translate-x-[-50%] w-[150px] h-[150px] bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header Trophy icon */}
      <div className="flex flex-col items-center text-center space-y-3 z-10 relative">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 animate-bounce">
          <Trophy className="w-8 h-8 fill-current" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-gray-50">Session Completed!</h2>
          <p className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
            {deck?.title || 'Study Session'}
          </p>
        </div>
      </div>

      {/* Stats Cards grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Cards studied */}
        <div className="bg-gray-50 dark:bg-darkBg/50 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl text-center">
          <BookOpen className="w-5 h-5 text-indigo-500 mx-auto mb-1.5" />
          <span className="text-[10px] font-semibold text-gray-550 dark:text-gray-400 uppercase tracking-wider block">
            Reviewed
          </span>
          <span className="text-lg font-bold text-gray-900 dark:text-gray-50 font-mono">
            {session.cards_studied}
          </span>
        </div>

        {/* Accuracy */}
        <div className="bg-gray-50 dark:bg-darkBg/50 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl text-center">
          <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto mb-1.5" />
          <span className="text-[10px] font-semibold text-gray-550 dark:text-gray-400 uppercase tracking-wider block">
            Recall Accuracy
          </span>
          <span className="text-lg font-bold text-gray-900 dark:text-gray-50 font-mono">
            {accuracy}%
          </span>
        </div>

        {/* Session Time */}
        <div className="bg-gray-50 dark:bg-darkBg/50 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl col-span-2 text-center flex items-center justify-center gap-3">
          <Clock className="w-5 h-5 text-violet-500 flex-shrink-0" />
          <div className="text-left">
            <span className="text-[10px] font-semibold text-gray-550 dark:text-gray-400 uppercase tracking-wider block leading-none">
              Time Studied
            </span>
            <span className="text-base font-bold text-gray-900 dark:text-gray-50 font-mono">
              {formatDuration(session.duration_seconds)}
            </span>
          </div>
        </div>
      </div>

      {/* Encouragement message */}
      <div className="text-center bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-100/40 dark:border-indigo-900/30 p-4 rounded-2xl text-sm text-gray-700 dark:text-gray-300 font-medium">
        {getEncouragement()}
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3">
        <Button
          onClick={() => navigate(`/study/${deckId}`)}
          variant="primary"
          className="w-full gap-2 py-3"
        >
          Study Again
        </Button>
        <Button
          onClick={() => navigate('/dashboard')}
          variant="outline"
          className="w-full py-3"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
};
