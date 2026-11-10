import React from 'react';


interface RatingButtonsProps {
  onRate: (rating: number) => void;
  disabled?: boolean;
}

export const RatingButtons: React.FC<RatingButtonsProps> = ({ onRate, disabled = false }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
      {/* Again */}
      <button
        onClick={() => onRate(1)}
        disabled={disabled}
        className="flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-rose-100 bg-rose-50/50 hover:bg-rose-50 dark:border-rose-950/20 dark:bg-rose-950/10 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-50"
      >
        <span className="text-base">Again</span>
        <span className="text-[10px] opacity-75 font-normal">Forget (1)</span>
      </button>

      {/* Hard */}
      <button
        onClick={() => onRate(2)}
        disabled={disabled}
        className="flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-amber-100 bg-amber-50/50 hover:bg-amber-50 dark:border-amber-950/20 dark:bg-amber-950/10 dark:hover:bg-amber-950/20 text-amber-600 dark:text-amber-400 font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-50"
      >
        <span className="text-base">Hard</span>
        <span className="text-[10px] opacity-75 font-normal">Struggled (2)</span>
      </button>

      {/* Good */}
      <button
        onClick={() => onRate(4)}
        disabled={disabled}
        className="flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 dark:border-indigo-950/20 dark:bg-indigo-950/10 dark:hover:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-50"
      >
        <span className="text-base">Good</span>
        <span className="text-[10px] opacity-75 font-normal">Recalled (4)</span>
      </button>

      {/* Easy */}
      <button
        onClick={() => onRate(5)}
        disabled={disabled}
        className="flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 dark:border-emerald-950/20 dark:bg-emerald-950/10 dark:hover:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-50"
      >
        <span className="text-base">Easy</span>
        <span className="text-[10px] opacity-75 font-normal">Perfect (5)</span>
      </button>
    </div>
  );
};
