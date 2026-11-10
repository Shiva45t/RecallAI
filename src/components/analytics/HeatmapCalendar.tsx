import React from 'react';

interface HeatmapCalendarProps {
  // Mapping of YYYY-MM-DD date strings to cards studied count
  data: Record<string, number>;
}

export const HeatmapCalendar: React.FC<HeatmapCalendarProps> = ({ data }) => {
  // Generate list of the last 90 dates
  const generateLast90Days = () => {
    const dates = [];
    for (let i = 89; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d);
    }
    return dates;
  };

  const dates = generateLast90Days();

  // Get color color intensity based on cards studied count
  const getColorClass = (count: number) => {
    if (!count || count === 0) return 'bg-gray-150 dark:bg-gray-800 hover:scale-110';
    if (count <= 5) return 'bg-indigo-200 dark:bg-indigo-900/40 hover:scale-110';
    if (count <= 15) return 'bg-indigo-400 dark:bg-indigo-700 hover:scale-110';
    return 'bg-indigo-600 dark:bg-indigo-500 hover:scale-110';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-305">
          Activity Calendar (Last 90 Days)
        </h4>
        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-gray-400">
          <span>Less</span>
          <span className="w-2.5 h-2.5 rounded-sm bg-gray-150 dark:bg-gray-800" />
          <span className="w-2.5 h-2.5 rounded-sm bg-indigo-200 dark:bg-indigo-900/40" />
          <span className="w-2.5 h-2.5 rounded-sm bg-indigo-400 dark:bg-indigo-700" />
          <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600 dark:bg-indigo-500" />
          <span>More</span>
        </div>
      </div>

      {/* Grid wrapper */}
      <div className="flex flex-wrap gap-1.5 p-4 bg-gray-50/50 dark:bg-darkBg/30 border border-gray-100 dark:border-gray-800 rounded-2xl max-w-full overflow-x-auto justify-center">
        <div className="grid grid-flow-col grid-rows-7 gap-1.5">
          {dates.map((date) => {
            const dateString = date.toISOString().split('T')[0];
            const count = data[dateString] || 0;
            const formattedDate = date.toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric'
            });

            return (
              <div
                key={dateString}
                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-sm transition-transform cursor-pointer ${getColorClass(count)}`}
                title={`${formattedDate}: ${count} cards studied`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
