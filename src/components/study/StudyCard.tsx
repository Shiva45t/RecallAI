import React from 'react';
import type { Card } from '../../types/card.types';
import { Badge } from '../ui/Badge';
import { HelpCircle, Eye } from 'lucide-react';

interface StudyCardProps {
  card: Card;
  isFlipped: boolean;
  onFlip: () => void;
  subject?: string | null;
}

export const StudyCard: React.FC<StudyCardProps> = ({
  card,
  isFlipped,
  onFlip,
  subject,
}) => {
  return (
    <div
      onClick={onFlip}
      className="w-full h-80 cursor-pointer perspective-1000 select-none group"
    >
      <div
        className={`w-full h-full relative transition-transform duration-500 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Card Front Side */}
        <div className="absolute inset-0 w-full h-full backface-hidden neo-glass-card-static rounded-3xl p-8 flex flex-col justify-between hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#0f172a] transition-all duration-200">
          <div className="flex items-center justify-between">
            {subject ? (
              <Badge variant="secondary">{subject}</Badge>
            ) : (
              <Badge variant="gray">General</Badge>
            )}
            <HelpCircle className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
          </div>

          <div className="flex-1 flex items-center justify-center py-4">
            <h3 className="text-xl sm:text-2xl font-bold text-center text-gray-900 dark:text-gray-50 leading-relaxed max-w-lg px-2 overflow-y-auto max-h-[160px]">
              {card.question}
            </h3>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 font-semibold uppercase tracking-wider">
            <Eye className="w-4 h-4 text-indigo-405" /> Click Card to Reveal Answer
          </div>
        </div>

        {/* Card Back Side */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 neo-glass-card-static rounded-3xl p-8 flex flex-col justify-between shadow-[4px_4px_0px_0px_#0f172a]">
          <div className="border-b border-gray-100 dark:border-gray-850 pb-3 flex items-center justify-between">
            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
              Context Question
            </span>
            <span className="text-xs text-gray-400 line-clamp-1 max-w-[200px] font-medium">
              {card.question}
            </span>
          </div>

          <div className="flex-1 flex items-center justify-center py-6 overflow-y-auto max-h-[160px]">
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-250 leading-relaxed text-center whitespace-pre-wrap max-w-lg">
              {card.answer}
            </p>
          </div>

          <div className="text-center text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
            Press any button below to rate your recall
          </div>
        </div>
      </div>
    </div>
  );
};
