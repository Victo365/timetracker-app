import React from 'react';
import { TimeEntry, WeekStartDay } from '../types';
import { getWeekDates, formatDate } from '../utils/timeUtils';
import { Clock } from 'lucide-react';

interface WeekViewProps {
  entries: TimeEntry[];
  weekStartDay: WeekStartDay;
  onEntryClick: (entry: TimeEntry) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({
  entries,
  weekStartDay,
  onEntryClick,
}) => {
  const weekDates = getWeekDates(new Date(), weekStartDay);

  const getEntriesForDate = (date: Date): TimeEntry[] => {
    return entries.filter((entry) => {
      const entryDate = new Date(entry.startTime);
      return (
        entryDate.getDate() === date.getDate() &&
        entryDate.getMonth() === date.getMonth() &&
        entryDate.getFullYear() === date.getFullYear()
      );
    });
  };

  return (
    <div className="grid grid-cols-7 gap-4 p-4">
      {weekDates.map((date) => (
        <div
          key={date.toISOString()}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
        >
          <h3 className="font-semibold text-lg mb-2">{formatDate(date)}</h3>
          <div className="space-y-2">
            {getEntriesForDate(date).map((entry) => (
              <div
                key={entry.id}
                onClick={() => onEntryClick(entry)}
                className="bg-gray-50 dark:bg-gray-700 p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <div className="flex items-center space-x-2">
                  <Clock size={16} />
                  <span>
                    {new Date(entry.startTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                {entry.project && (
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {entry.project}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};