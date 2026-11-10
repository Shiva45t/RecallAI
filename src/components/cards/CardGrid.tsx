import React from 'react';
import type { Card } from '../../types/card.types';
import { Skeleton } from '../ui/Skeleton';
import { Badge } from '../ui/Badge';
import { Edit2, Trash2, HelpCircle, Calendar } from 'lucide-react';
import { formatDate } from '../../utils/date.utils';

interface CardGridProps {
  cards: Card[];
  onEdit: (card: Card) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export const CardGrid: React.FC<CardGridProps> = ({
  cards,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 4].map((n) => (
          <Skeleton key={n} className="h-[140px] w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center border border-dashed border-gray-250 dark:border-gray-805 rounded-2xl p-12 text-center bg-white/20 dark:bg-darkSurface/10">
        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-3">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-gray-900 dark:text-gray-150 mb-1">No Cards in Deck</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs">
          This deck is currently empty. Add cards manually or use AI to generate them.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {cards.map((card) => {
        const isDue = new Date(card.next_review_at) <= new Date();

        return (
          <div
            key={card.id}
            className="flex flex-col justify-between overflow-hidden rounded-2xl bg-white dark:bg-darkSurface border border-gray-150 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200 p-5 group relative"
          >
            {/* Top controls and status badges */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-1.5">
                {isDue ? (
                  <Badge variant="warning">Due for Review</Badge>
                ) : (
                  <Badge variant="success">Scheduled</Badge>
                )}
              </div>

              {/* Edit/Delete triggers */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEdit(card)}
                  className="p-1.5 text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="Edit Card"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this card?')) {
                      onDelete(card.id);
                    }
                  }}
                  className="p-1.5 text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="Delete Card"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* QA Content */}
            <div className="space-y-2 flex-1">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-indigo-500 uppercase">
                  Question
                </span>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                  {card.question}
                </p>
              </div>
              <div className="pt-2 border-t border-gray-50 dark:border-gray-850">
                <span className="text-[10px] font-bold tracking-wider text-violet-500 uppercase">
                  Answer
                </span>
                <p className="text-xs text-gray-650 dark:text-gray-400 line-clamp-2">
                  {card.answer}
                </p>
              </div>
            </div>

            {/* Spaced repetition parameters footer */}
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[10px] font-mono text-gray-500 dark:text-gray-450">
              <div className="flex gap-3">
                <span>EF: <span className="font-semibold text-gray-700 dark:text-gray-300">{card.ease_factor.toFixed(2)}</span></span>
                <span>Interval: <span className="font-semibold text-gray-700 dark:text-gray-300">{card.interval}d</span></span>
                <span>Reps: <span className="font-semibold text-gray-700 dark:text-gray-300">{card.repetitions}</span></span>
              </div>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-indigo-400" />
                Next: {formatDate(card.next_review_at)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
