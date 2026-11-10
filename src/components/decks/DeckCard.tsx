import React from 'react';
import type { Deck } from '../../types/deck.types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Edit2, Trash2, Play } from 'lucide-react';

interface DeckCardProps {
  deck: Deck;
  onEdit?: (deck: Deck) => void;
  onDelete?: (id: string) => void;
}

export const DeckCard: React.FC<DeckCardProps> = ({ deck, onEdit, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div className="relative flex flex-col justify-between overflow-hidden neo-glass-card group">
      {/* Top Color Accent Line */}
      <div className="h-2 w-full" style={{ backgroundColor: deck.color }} />

      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            {deck.subject ? (
              <Badge variant="secondary" className="truncate max-w-[150px]">
                {deck.subject}
              </Badge>
            ) : (
              <Badge variant="gray">General</Badge>
            )}

            {/* Quick Actions (Edit/Delete) */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(deck);
                  }}
                  className="p-1 text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                  title="Edit Deck"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Are you sure you want to delete this deck and all of its cards?')) {
                      onDelete(deck.id);
                    }
                  }}
                  className="p-1 text-gray-400 hover:text-rose-500 dark:hover:text-rose-450 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                  title="Delete Deck"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50 line-clamp-1 mb-1">
            {deck.title}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-450 line-clamp-2 h-8">
            {deck.description || 'No description provided.'}
          </p>
        </div>

        <div className="flex items-center justify-between border-t border-gray-50 dark:border-gray-850 pt-3 mt-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            <span className="font-bold text-gray-700 dark:text-gray-300">{deck.card_count || 0}</span> cards
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/decks/${deck.id}`)}
              className="text-xs py-1"
            >
              Manage
            </Button>
            {deck.card_count > 0 ? (
              <Button
                size="sm"
                variant="primary"
                onClick={() => navigate(`/study/${deck.id}`)}
                className="text-xs py-1 gap-1"
              >
                <Play className="w-3 h-3 fill-current" /> Study
              </Button>
            ) : (
              <Button
                size="sm"
                variant="primary"
                onClick={() => navigate(`/generate?deckId=${deck.id}`)}
                className="text-xs py-1"
              >
                + AI Cards
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
