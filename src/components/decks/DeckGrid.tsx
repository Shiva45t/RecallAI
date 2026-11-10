import React from 'react';
import type { Deck } from '../../types/deck.types';
import { DeckCard } from './DeckCard';
import { Skeleton } from '../ui/Skeleton';
import { Layers } from 'lucide-react';

interface DeckGridProps {
  decks: Deck[];
  onEdit?: (deck: Deck) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
  emptyAction?: React.ReactNode;
}

export const DeckGrid: React.FC<DeckGridProps> = ({
  decks,
  onEdit,
  onDelete,
  isLoading = false,
  emptyAction,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((n) => (
          <Skeleton key={n} className="h-[180px] w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (decks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center border border-dashed border-gray-250 dark:border-gray-800 rounded-2xl p-12 text-center bg-white/20 dark:bg-darkSurface/10 backdrop-blur-sm">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 dark:bg-indigo-650/10 flex items-center justify-center text-indigo-500 dark:text-indigo-400 mb-4 shadow-sm">
          <Layers className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">No Decks Found</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
          Decks group flashcards by subject. Create one manually or generate questions using AI.
        </p>
        {emptyAction}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {decks.map((deck) => (
        <DeckCard
          key={deck.id}
          deck={deck}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
