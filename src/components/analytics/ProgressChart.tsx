import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

interface ProgressData {
  date: string; // YYYY-MM-DD
  accuracy: number; // percentage (0 - 100)
}

interface ProgressChartProps {
  data: ProgressData[];
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ data }) => {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-305">
        Accuracy Trend (Last 14 Days)
      </h4>

      <div className="h-64 w-full bg-gray-50/50 dark:bg-darkBg/30 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-gray-500">
            Complete study sessions to generate accuracy trends.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(str) => {
                  const parts = str.split('-');
                  return parts[2] ? `${parts[1]}/${parts[2]}` : str;
                }}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a2e',
                  border: '1px solid #374151',
                  borderRadius: '12px',
                  color: '#f3f4f6',
                  fontSize: '11px'
                }}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ r: 4, stroke: '#6366f1', strokeWidth: 2, fill: '#ffffff' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
