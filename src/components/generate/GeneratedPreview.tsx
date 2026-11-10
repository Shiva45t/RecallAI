import React, { useState } from 'react';
import type { GeneratedCard } from '../../types/ai.types';
import type { Deck } from '../../types/deck.types';
import { Button } from '../ui/Button';
import { useUIStore } from '../../stores/ui.store';
import { 
  Trash2, 
  Save, 
  Sparkles, 
  Layers, 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  HelpCircle, 
  CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GeneratedPreviewProps {
  initialCards: GeneratedCard[];
  decks: Deck[];
  selectedDeckId: string;
  onDeckIdChange: (id: string) => void;
  onSave: (cards: GeneratedCard[]) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export const GeneratedPreview: React.FC<GeneratedPreviewProps> = ({
  initialCards,
  decks,
  selectedDeckId,
  onDeckIdChange,
  onSave,
  onCancel,
  isLoading,
}) => {
  const [cards, setCards] = useState<GeneratedCard[]>(initialCards);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(0); // -1 = left/prev, 1 = right/next
  const { addToast } = useUIStore();

  const handleCardChange = (index: number, key: 'question' | 'answer', value: string) => {
    setCards((prev) =>
      prev.map((card, i) => (i === index ? { ...card, [key]: value } : card))
    );
  };

  const handleDeleteCard = (index: number) => {
    if (cards.length === 0) return;
    
    // Animate transition on delete
    setDirection(1);
    setIsFlipped(false);
    
    setCards((prev) => {
      const nextCards = prev.filter((_, i) => i !== index);
      // Adjust active index if we delete the last item
      if (activeIndex >= nextCards.length && activeIndex > 0) {
        setActiveIndex(nextCards.length - 1);
      }
      return nextCards;
    });
    addToast('Card discarded.', 'info');
  };

  const handleSaveClick = async () => {
    if (cards.length === 0) return;
    await onSave(cards);
  };

  const handleNext = () => {
    if (activeIndex < cards.length - 1) {
      setDirection(1);
      setIsFlipped(false);
      setActiveIndex(activeIndex + 1);
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      setDirection(-1);
      setIsFlipped(false);
      setActiveIndex(activeIndex - 1);
    }
  };

  const activeCard = cards[activeIndex];

  // Slide transitions for cards
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 150 : dir < 0 ? -150 : 0,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring' as const, stiffness: 350, damping: 25 },
        opacity: { duration: 0.15 }
      }
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 150 : dir > 0 ? -150 : 0,
      opacity: 0,
      scale: 0.95,
      transition: {
        x: { type: 'spring' as const, stiffness: 350, damping: 25 },
        opacity: { duration: 0.15 }
      }
    })
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 dark:border-gray-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50 flex items-center gap-1.5">
            <Sparkles className="w-5 h-5 text-amber-500 fill-current animate-pulse" /> Review AI Generated Cards
          </h3>
          <p className="text-xs text-gray-550 dark:text-gray-400 mt-0.5">
            Refine, edit, or remove individual cards before adding them to your library.
          </p>
        </div>
        <span className="text-xs font-mono font-semibold bg-indigo-50 border border-indigo-200 text-indigo-600 dark:bg-indigo-950/20 dark:border-indigo-900/50 dark:text-indigo-300 px-3 py-1 rounded-full">
          Count: {cards.length} cards
        </span>
      </div>

      {/* Select Destination Deck */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-indigo-50/20 dark:bg-darkSurface/50 border border-indigo-100/40 dark:border-gray-800 p-4 rounded-xl">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 flex-shrink-0">
          <Layers className="w-5 h-5" />
          <span className="text-sm font-semibold">Select Destination Deck:</span>
        </div>
        <select
          value={selectedDeckId}
          onChange={(e) => onDeckIdChange(e.target.value)}
          className="flex-1 px-4 py-2 text-sm rounded-lg border border-indigo-200 dark:border-gray-800 bg-white dark:bg-darkSurface text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer font-medium"
          disabled={isLoading}
        >
          <option value="">-- Choose a deck --</option>
          {decks.map((deck) => (
            <option key={deck.id} value={deck.id}>
              {deck.title} {deck.subject ? `(${deck.subject})` : ''}
            </option>
          ))}
        </select>
      </div>

      {cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-white/20">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            You have deleted all generated cards.
          </p>
          <Button onClick={onCancel} variant="outline">
            Generate Again
          </Button>
        </div>
      ) : (
        /* Dynamic 3D Card Stack Preview */
        <div className="py-6 flex flex-col items-center justify-center min-h-[380px]">
          {/* Card stack wrapper */}
          <div className="relative w-full max-w-lg h-[300px] px-4">
            {/* Background stack layer 2 (bottom-most) */}
            {cards.length > 2 && activeIndex < cards.length - 2 && (
              <div className="absolute inset-x-8 inset-y-0 bg-white/30 dark:bg-darkSurface/30 border border-gray-150/40 dark:border-gray-800/40 rounded-3xl translate-y-6 scale-[0.94] shadow-sm -z-20 transition-all duration-300" />
            )}
            
            {/* Background stack layer 1 (middle) */}
            {cards.length > 1 && activeIndex < cards.length - 1 && (
              <div className="absolute inset-x-6 inset-y-0 bg-white/60 dark:bg-darkSurface/65 border border-gray-150/70 dark:border-gray-800/70 rounded-3xl translate-y-3 scale-[0.97] shadow-md -z-10 transition-all duration-300" />
            )}

            {/* Main Interactive Card */}
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={activeIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0 w-full h-full px-4"
              >
                <motion.div
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                  style={{ transformStyle: 'preserve-3d' }}
                  className="w-full h-full relative cursor-default"
                >
                  {/* FRONT SIDE (Question) */}
                  <div 
                    className="absolute inset-0 w-full h-full bg-white dark:bg-darkSurface border border-gray-150 dark:border-gray-800 rounded-3xl p-6 flex flex-col justify-between shadow-lg hover:shadow-xl transition-shadow duration-200"
                    style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                      <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4" /> Question Card {activeIndex + 1} of {cards.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteCard(activeIndex)}
                        className="p-1.5 text-gray-400 hover:text-rose-500 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title="Discard Card"
                        disabled={isLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Edit Area */}
                    <div className="flex-1 flex flex-col justify-center py-3">
                      <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1">
                        Edit Question Content
                      </span>
                      <textarea
                        value={activeCard?.question || ''}
                        onChange={(e) => handleCardChange(activeIndex, 'question', e.target.value)}
                        className="w-full flex-1 text-base font-bold text-gray-900 dark:text-gray-100 bg-transparent outline-none border-b border-dashed border-gray-150 dark:border-gray-800 hover:border-indigo-500/30 focus:border-indigo-500 p-1 resize-none leading-relaxed"
                        placeholder="Type question content here..."
                        disabled={isLoading}
                        rows={3}
                      />
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                      <span className="text-[10px] text-gray-400 dark:text-gray-505 font-semibold uppercase tracking-wider">
                        Tap Flip to Review Answer
                      </span>
                      <Button
                        type="button"
                        onClick={() => setIsFlipped(true)}
                        size="sm"
                        variant="outline"
                        className="text-xs py-1 px-3 gap-1.5 rounded-xl border-gray-200 dark:border-gray-800 text-gray-650 dark:text-gray-300"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Flip Card
                      </Button>
                    </div>
                  </div>

                  {/* BACK SIDE (Answer) */}
                  <div 
                    className="absolute inset-0 w-full h-full bg-white dark:bg-darkSurface border border-gray-150 dark:border-gray-800 rounded-3xl p-6 flex flex-col justify-between shadow-lg hover:shadow-xl transition-shadow duration-200"
                    style={{ 
                      backfaceVisibility: 'hidden', 
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)' 
                    }}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                      <span className="text-[10px] font-bold text-violet-505 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Answer Explanation {activeIndex + 1} of {cards.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteCard(activeIndex)}
                        className="p-1.5 text-gray-400 hover:text-rose-500 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title="Discard Card"
                        disabled={isLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Edit Area */}
                    <div className="flex-1 flex flex-col justify-center py-3">
                      <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1">
                        Edit Answer Content
                      </span>
                      <textarea
                        value={activeCard?.answer || ''}
                        onChange={(e) => handleCardChange(activeIndex, 'answer', e.target.value)}
                        className="w-full flex-1 text-sm text-gray-700 dark:text-gray-250 bg-transparent outline-none border-b border-dashed border-gray-150 dark:border-gray-800 hover:border-violet-500/30 focus:border-violet-500 p-1 resize-none leading-relaxed"
                        placeholder="Type answer content here..."
                        disabled={isLoading}
                        rows={3}
                      />
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                      <span className="text-[10px] text-gray-400 dark:text-gray-505 font-semibold uppercase tracking-wider">
                        Tap Flip to Review Question
                      </span>
                      <Button
                        type="button"
                        onClick={() => setIsFlipped(false)}
                        size="sm"
                        variant="outline"
                        className="text-xs py-1 px-3 gap-1.5 rounded-xl border-gray-200 dark:border-gray-800 text-gray-650 dark:text-gray-300"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Flip Card
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Carousel Navigation Buttons */}
          <div className="flex items-center justify-center gap-6 mt-6 w-full max-w-sm">
            <button
              type="button"
              onClick={handlePrev}
              disabled={activeIndex === 0 || isLoading}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-darkSurface text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-850 disabled:opacity-40 disabled:cursor-not-allowed hover:border-indigo-500/30 transition-all duration-200 active:scale-95 shadow-sm"
              title="Previous Card"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            {/* Card Index dots */}
            <div className="flex items-center justify-center gap-1.5 max-w-[150px] overflow-x-auto py-1.5 px-2">
              {cards.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setDirection(i > activeIndex ? 1 : -1);
                    setIsFlipped(false);
                    setActiveIndex(i);
                  }}
                  disabled={isLoading}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-200 shrink-0 ${
                    i === activeIndex 
                      ? 'bg-indigo-600 dark:bg-indigo-500 w-6' 
                      : 'bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700'
                  }`}
                  title={`Go to Card ${i + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleNext}
              disabled={activeIndex === cards.length - 1 || isLoading}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-darkSurface text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-850 disabled:opacity-40 disabled:cursor-not-allowed hover:border-indigo-500/30 transition-all duration-200 active:scale-95 shadow-sm"
              title="Next Card"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Buttons */}
      {cards.length > 0 && (
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-800 pt-5">
          <Button onClick={onCancel} variant="outline" disabled={isLoading}>
            Discard All
          </Button>
          <Button
            onClick={handleSaveClick}
            variant="primary"
            className="gap-2"
            isLoading={isLoading}
            disabled={!selectedDeckId}
          >
            <Save className="w-4 h-4" /> Save {cards.length} Cards
          </Button>
        </div>
      )}
    </div>
  );
};
