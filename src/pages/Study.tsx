import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStudyStore } from '../stores/study.store';
import { useUIStore } from '../stores/ui.store';
import { db } from '../lib/dexie';
import type { Deck } from '../types/deck.types';
import { StudyCard } from '../components/study/StudyCard';
import { RatingButtons } from '../components/study/RatingButtons';
import { ProgressBar } from '../components/study/ProgressBar';
import { Button } from '../components/ui/Button';
import { aiService } from '../services/ai.service';
import { formatDurationClock } from '../utils/format.utils';
import { ArrowLeft, Eye, Sparkles, Clock, AlertCircle, Map } from 'lucide-react';
import { QuizEvaluator } from '../components/study/QuizEvaluator';
import { ConceptMap } from '../components/study/ConceptMap';
import type { ConceptMapData } from '../types/ai.types';

export const Study: React.FC = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const { addToast } = useUIStore();

  const {
    cards,
    currentIndex,
    startTime,
    isLoading,
    studyAllMode,
    startSession,
    submitRating,
    finishSession,
    resetSession,
  } = useStudyStore();

  const [deck, setDeck] = useState<Deck | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Hint states
  const [hint, setHint] = useState('');
  const [isHintLoading, setIsHintLoading] = useState(false);

  // AI study feature states
  const [studyMode, setStudyMode] = useState<'flashcard' | 'quiz'>('flashcard');
  const [aiScore, setAiScore] = useState<number | null>(null);

  // Concept Map states
  const [conceptMap, setConceptMap] = useState<ConceptMapData | null>(null);
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load deck info & start study session
  useEffect(() => {
    if (!deckId) return;

    db.decks.get(deckId).then((deckData) => {
      if (deckData) setDeck(deckData);
    });

    startSession(deckId);

    return () => {
      resetSession();
      if (timerRef.current) clearInterval(timerRef.current);
      setAiScore(null);
      setConceptMap(null);
      setShowMap(false);
    };
  }, [deckId]);

  // Duration clock timer effect
  useEffect(() => {
    if (startTime) {
      if (timerRef.current) clearInterval(timerRef.current);
      
      timerRef.current = setInterval(() => {
        const secs = Math.round((Date.now() - startTime) / 1000);
        setElapsedTime(secs);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTime]);

  // Check if session is complete
  useEffect(() => {
    if (cards.length > 0 && currentIndex >= cards.length) {
      handleFinishSession();
    }
  }, [currentIndex, cards]);

  const handleFinishSession = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      const session = await finishSession();
      if (session) {
        addToast('Study session completed!', 'success');
        navigate(`/study/${deckId}/summary`, { state: { session } });
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to record session stats.', 'error');
      navigate('/dashboard');
    }
  };

  const handleRate = (rating: number) => {
    // Reset card states
    setIsFlipped(false);
    setHint('');
    setAiScore(null);
    setConceptMap(null);
    setShowMap(false);
    
    // Submit card rating
    submitRating(rating);
  };

  // AI Hint streaming click handler
  const handleRequestHint = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid flipping the card when tapping hint
    if (isHintLoading || !cards[currentIndex]) return;

    setHint('');
    setIsHintLoading(true);
    
    try {
      const currentCard = cards[currentIndex];
      await aiService.generateHint(currentCard.question, (chunk) => {
        setHint((prev) => prev + chunk);
      });
    } catch (err: any) {
      addToast(err.message || 'AI Hint service is busy.', 'warning');
    } finally {
      setIsHintLoading(false);
    }
  };

  const getRecommendedRatingText = (score: number) => {
    if (score >= 85) return 'Easy (Perfect recall)';
    if (score >= 60) return 'Good (Recalled)';
    if (score >= 35) return 'Hard (Struggled)';
    return 'Again (Forgot)';
  };

  const handleToggleConceptMap = async () => {
    if (showMap) {
      setShowMap(false);
      return;
    }

    setShowMap(true);
    if (conceptMap) return;

    setIsMapLoading(true);
    try {
      const data = await aiService.generateConceptMap(
        currentCard.question,
        currentCard.answer
      );
      setConceptMap(data);
    } catch (err: any) {
      addToast(err.message || 'AI is busy. Could not build concept map.', 'warning');
      setShowMap(false);
    } finally {
      setIsMapLoading(false);
    }
  };

  if (isLoading && cards.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <Clock className="w-10 h-10 animate-spin text-indigo-500" />
        <span className="mt-4 text-sm font-semibold text-gray-500">Preparing study cards...</span>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Back navigation header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`/decks/${deckId}`)}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-250 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Exit Session
        </button>

        {startTime && (
          <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span className="font-mono">{formatDurationClock(elapsedTime)}</span>
          </div>
        )}
      </div>

      {cards.length === 0 ? (
        /* Empty / No due cards state */
        <div className="flex flex-col items-center justify-center border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center bg-white/20 dark:bg-darkSurface/10 backdrop-blur-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4 animate-pulse">
            <Eye className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-105 mb-1">No Cards Due for Review</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
            You've studied all scheduled cards for this deck!
          </p>
          <div className="flex gap-3">
            <Button onClick={() => startSession(deckId!, true)} variant="outline">
              Study All Anyway
            </Button>
            <Button onClick={() => navigate('/dashboard')} variant="primary">
              Back to Dashboard
            </Button>
          </div>
        </div>
      ) : (
        /* Study Panel */
        currentCard && (
          <div className="space-y-6">
            {/* Progress counter */}
            <ProgressBar current={currentIndex} total={cards.length} />

            {/* Study Mode Toggles */}
            <div className="flex bg-gray-100 dark:bg-darkBg/60 p-1.5 rounded-2xl border border-gray-150 dark:border-gray-800">
              <button
                onClick={() => {
                  setStudyMode('flashcard');
                  setIsFlipped(false);
                  setHint('');
                  setConceptMap(null);
                  setShowMap(false);
                  setAiScore(null);
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-extrabold rounded-xl transition-all ${
                  studyMode === 'flashcard'
                    ? 'bg-white dark:bg-darkSurface text-indigo-600 dark:text-indigo-400 shadow-sm border border-gray-100 dark:border-gray-800'
                    : 'text-gray-400 hover:text-gray-600 dark:text-gray-500'
                }`}
              >
                Classic Flashcard
              </button>
              <button
                onClick={() => {
                  setStudyMode('quiz');
                  setIsFlipped(false);
                  setHint('');
                  setConceptMap(null);
                  setShowMap(false);
                  setAiScore(null);
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-extrabold rounded-xl transition-all ${
                  studyMode === 'quiz'
                    ? 'bg-white dark:bg-darkSurface text-indigo-600 dark:text-indigo-400 shadow-sm border border-gray-100 dark:border-gray-800'
                    : 'text-gray-400 hover:text-gray-600 dark:text-gray-500'
                }`}
              >
                AI Interactive Quiz
              </button>
            </div>

            {studyAllMode && (
              <div className="bg-indigo-50 border border-indigo-150 text-indigo-750 text-xs py-2 px-4 rounded-xl flex items-center gap-2 dark:bg-indigo-950/20 dark:border-indigo-900/50 dark:text-indigo-350">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> Free study mode (SM-2 intervals will still adjust).
              </div>
            )}

            {/* 3D Flashcard */}
            <StudyCard
              card={currentCard}
              isFlipped={isFlipped}
              onFlip={() => {
                if (studyMode === 'flashcard' || aiScore !== null) {
                  setIsFlipped(!isFlipped);
                } else {
                  addToast('Please submit your answer for AI evaluation first.', 'info');
                }
              }}
              subject={deck?.subject}
            />

            {/* AI Interactive Quiz response evaluator */}
            {studyMode === 'quiz' && (
              <QuizEvaluator
                question={currentCard.question}
                correctAnswer={currentCard.answer}
                onEvaluationComplete={(evalRes) => {
                  setIsFlipped(true); // reveal official answer
                  setAiScore(evalRes.score);
                }}
                onReset={() => {
                  setIsFlipped(false);
                  setAiScore(null);
                }}
              />
            )}

            {/* AI Hint Module */}
            <div className="neo-glass-card-static p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                  <Sparkles className="w-4 h-4 text-amber-500 fill-current animate-pulse" />
                  <span>Stuck? Get an AI Nudge</span>
                </div>
                <Button
                  onClick={handleRequestHint}
                  size="sm"
                  variant="outline"
                  className="text-xs py-1"
                  disabled={isHintLoading}
                >
                  {isHintLoading ? 'Generating Hint...' : hint ? 'Regenerate' : 'Ask for Hint'}
                </Button>
              </div>

              {hint && (
                <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-darkBg/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800 animate-fade-in font-medium italic">
                  "{hint}"
                </div>
              )}
            </div>

            {/* Visualize Concept Map Button */}
            {isFlipped && (
              <div className="flex justify-center pt-2">
                <Button
                  onClick={handleToggleConceptMap}
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs text-indigo-650 border-indigo-200 dark:text-indigo-400 dark:border-indigo-900/50 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 py-2.5 px-4 rounded-xl font-bold"
                  disabled={isMapLoading}
                >
                  <Map className="w-3.5 h-3.5 animate-pulse" />
                  {isMapLoading ? 'Constructing Map...' : showMap ? 'Hide Concept Map' : 'Visualize Concept Map'}
                </Button>
              </div>
            )}

            {/* Interactive Concept Map Panel */}
            {showMap && conceptMap && (
              <div className="animate-fade-in">
                <ConceptMap mapData={conceptMap} />
              </div>
            )}

            {/* Recommended Rating Banner */}
            {studyMode === 'quiz' && aiScore !== null && (
              <div className="w-full text-center py-2.5 px-4 bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-950/30 rounded-xl text-xs font-bold text-indigo-750 dark:text-indigo-300 animate-pulse">
                AI Recommendation: <span className="underline uppercase">{getRecommendedRatingText(aiScore)}</span>
              </div>
            )}

            {/* Lower Rating controls */}
            <div className="flex justify-center border-t border-gray-100 dark:border-gray-850 pt-6">
              {!isFlipped ? (
                <Button
                  onClick={() => setIsFlipped(true)}
                  size="lg"
                  className="w-full gap-2"
                >
                  <Eye className="w-5 h-5" /> Show Answer
                </Button>
              ) : (
                <RatingButtons onRate={handleRate} />
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
};
