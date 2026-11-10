import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex justify-between items-center text-xs font-semibold text-gray-550 dark:text-gray-400">
        <span>Progress</span>
        <span>{current} of {total} cards</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden shadow-inner">
        <div
          className="bg-indigo-650 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
