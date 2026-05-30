'use client';

import type { DailyReadingActivity } from '@repo/types';
import { formatWeekday } from '../utils/achievementProgress';

type ChartMetric = 'pages' | 'minutes';

interface WeeklyActivityChartProps {
  data: DailyReadingActivity[];
  metric: ChartMetric;
  title: string;
  accentColor: string;
}

export function WeeklyActivityChart({ data, metric, title, accentColor }: WeeklyActivityChartProps) {
  const values = data.map((day) => (metric === 'pages' ? day.pages_read : day.minutes_read));
  const max = Math.max(...values, 1);
  const total = values.reduce((sum, v) => sum + v, 0);
  const unit = metric === 'pages' ? 'pages' : 'min';
  const isEmpty = total === 0;

  return (
    <div className="bg-white border border-[#E8E2D9] rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-semibold text-[#1A2A3A]">{title}</h3>
          <p className="text-sm text-[#4A5568] mt-0.5">
            {isEmpty ? 'Last 7 days' : `Last 7 days · ${total} ${unit} total`}
          </p>
        </div>
        <span
          className="text-xs font-medium px-2.5 py-1 rounded-full"
          style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
        >
          7D
        </span>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center h-44 text-center px-4">
          <p className="text-sm text-[#4A5568]">
            No daily stats yet — read or listen for 20+ seconds and return here.
          </p>
        </div>
      ) : (
        <div className="flex items-end gap-2 h-44">
        {data.map((day, index) => {
          const value = values[index] ?? 0;
          const heightPct = Math.max((value / max) * 100, value > 0 ? 8 : 4);
          const isToday = index === data.length - 1;

          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-2 min-w-0">
              <span className="text-[10px] font-medium text-[#4A5568] tabular-nums">
                {value > 0 ? value : '·'}
              </span>
              <div className="w-full flex-1 flex items-end">
                <div
                  className="w-full rounded-t-lg transition-all duration-500 relative group"
                  style={{
                    height: `${heightPct}%`,
                    backgroundColor: isToday ? accentColor : `${accentColor}${value > 0 ? 'CC' : '33'}`,
                    minHeight: value > 0 ? '8px' : '4px',
                  }}
                  title={`${formatWeekday(day.date)}: ${value} ${unit}`}
                />
              </div>
              <span
                className={`text-[10px] truncate w-full text-center ${
                  isToday ? 'font-semibold text-[#1A2A3A]' : 'text-[#4A5568]'
                }`}
              >
                {formatWeekday(day.date)}
              </span>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}
