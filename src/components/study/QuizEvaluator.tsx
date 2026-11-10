import React, { useState } from 'react';
import type { QuizEvaluation } from '../../types/ai.types';
import { aiService } from '../../services/ai.service';
import { useUIStore } from '../../stores/ui.store';
import { Button } from '../ui/Button';
import { Sparkles, RefreshCw, CheckCircle, AlertCircle, Award, Keyboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizEvaluatorProps {
  question: string;
  correctAnswer: string;
  onEvaluationComplete: (evaluation: QuizEvaluation) => void;
  onReset: () => void;
}

export const QuizEvaluator: React.FC<QuizEvaluatorProps> = ({
  question,
  correctAnswer,
  onEvaluationComplete,
  onReset,
}) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluation, setEvaluation] = useState<QuizEvaluation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useUIStore();

  const handleEvaluate = async () => {
    if (!userAnswer.trim()) {
      addToast('Please type an answer to evaluate.', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const result = await aiService.evaluateAnswer(question, correctAnswer, userAnswer);
      setEvaluation(result);
      onEvaluationComplete(result);
    } catch (err: any) {
      console.error(err);
      addToast('Failed to evaluate answer. AI service is busy.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setEvaluation(null);
    setUserAnswer('');
    onReset();
  };

  // Color matching score logic
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500 stroke-emerald-500';
    if (score >= 50) return 'text-amber-500 stroke-amber-500';
    return 'text-rose-500 stroke-rose-500';
  };

  return (
    <div className="w-full bg-white dark:bg-darkSurface border border-gray-150 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
      <AnimatePresence mode="wait">
        {!evaluation ? (
          /* Answer Input Form */
          <motion.div
            key="input-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              <Keyboard className="w-4 h-4 text-indigo-500 animate-pulse" />
              <span>Interactive Quiz Recall</span>
            </div>

            <div className="relative">
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Type your explanation or memory recall of the card answer here..."
                rows={5}
                disabled={isLoading}
                className="w-full p-4 text-sm bg-gray-50/50 dark:bg-darkBg/30 border border-gray-150 dark:border-gray-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 resize-none font-medium text-gray-800 dark:text-gray-200"
              />
              <span className="absolute bottom-3 right-4 text-[10px] text-gray-400 font-bold">
                {userAnswer.length} characters
              </span>
            </div>

            <Button
              onClick={handleEvaluate}
              className="w-full gap-2 py-3"
              variant="primary"
              isLoading={isLoading}
              disabled={isLoading || !userAnswer.trim()}
            >
              <Sparkles className="w-4 h-4 fill-current" />
              {isLoading ? 'AI Analyzing...' : 'Submit Answer for AI Evaluation'}
            </Button>
          </motion.div>
        ) : (
          /* Evaluation Scorecard */
          <motion.div
            key="evaluation-score"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6 animate-fade-in"
          >
            {/* Scorecard Radial Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-indigo-50 dark:border-indigo-950/20 bg-indigo-50/20 dark:bg-indigo-950/5 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500">
                  <Award className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-gray-900 dark:text-gray-105">AI Evaluation Scorecard</h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-450 uppercase tracking-wider font-bold">Concept recall similarity</p>
                </div>
              </div>

              {/* Radial Progress Ring */}
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    strokeWidth="4"
                    fill="transparent"
                    className="stroke-gray-100 dark:stroke-gray-800"
                  />
                  <motion.circle
                    cx="32"
                    cy="32"
                    r="26"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 26}
                    initial={{ strokeDashoffset: 2 * Math.PI * 26 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 26 * (1 - evaluation.score / 100) }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className={`${getScoreColor(evaluation.score)}`}
                  />
                </svg>
                <span className={`absolute text-sm font-extrabold font-mono ${getScoreColor(evaluation.score).split(' ')[0]}`}>
                  {evaluation.score}%
                </span>
              </div>
            </div>

            {/* AI Feedback text */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-450 dark:text-gray-500 uppercase tracking-wider">AI Evaluation & Feedback</span>
              <p className="text-xs text-gray-650 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-darkBg/40 border border-gray-100 dark:border-gray-850 p-3.5 rounded-xl italic">
                "{evaluation.feedback}"
              </p>
            </div>

            {/* Strengths and Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="space-y-2 border border-emerald-50 dark:border-emerald-950/20 bg-emerald-50/10 dark:bg-emerald-950/5 p-4 rounded-2xl">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  <CheckCircle className="w-4 h-4" />
                  <span>Key Points You Recalled</span>
                </div>
                {evaluation.strengths.length > 0 ? (
                  <ul className="space-y-1.5">
                    {evaluation.strengths.map((str, idx) => (
                      <li key={idx} className="text-xs text-gray-650 dark:text-gray-300 flex items-start gap-1">
                        <span className="text-emerald-500 font-bold mt-0.5">•</span>
                        <span className="leading-tight">{str}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-400 italic">No specific concepts were matched.</p>
                )}
              </div>

              {/* Weaknesses */}
              <div className="space-y-2 border border-rose-50 dark:border-rose-950/20 bg-rose-50/10 dark:bg-rose-950/5 p-4 rounded-2xl">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                  <AlertCircle className="w-4 h-4" />
                  <span>Key Details You Missed</span>
                </div>
                {evaluation.weaknesses.length > 0 ? (
                  <ul className="space-y-1.5">
                    {evaluation.weaknesses.map((weak, idx) => (
                      <li key={idx} className="text-xs text-gray-650 dark:text-gray-300 flex items-start gap-1">
                        <span className="text-rose-400 font-bold mt-0.5">•</span>
                        <span className="leading-tight">{weak}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 italic font-semibold">Perfect! You captured all essential points.</p>
                )}
              </div>
            </div>

            {/* Try again control */}
            <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-850">
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-350 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Re-attempt Response
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
