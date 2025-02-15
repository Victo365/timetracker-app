import React, { useState } from 'react';
import { TimeEntry, WeekStartDay } from '../types';
import { getWeekDates, formatDate } from '../utils/timeUtils';
import { Plus, Trash2, Ban } from 'lucide-react';

interface WeeklyLogProps {
  entries: TimeEntry[];
  weekStartDay: WeekStartDay;
  onAddEntry: (date: Date, startTime: string, endTime: string) => void;
  onDeleteEntry: (entry: TimeEntry) => void;
  onMarkDayNotWorked: (date: Date, reason?: string) => void;
}

export const WeeklyLog: React.FC<WeeklyLogProps> = ({
  entries,
  weekStartDay,
  onAddEntry,
  onDeleteEntry,
  onMarkDayNotWorked,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  const weekDates = getWeekDates(new Date(), weekStartDay);

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(timeString);
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  const handleAddClick = (date: Date) => {
    // Check if there's already an entry for this date
    const existingEntry = getEntriesForDate(date);
    if (existingEntry.length > 0) {
      return; // Don't open modal if there's already an entry
    }
    
    setSelectedDate(date);
    setShowAddModal(true);
  };

  const handleNotWorkedClick = (date: Date) => {
    // Delete any existing entries for this date first
    const existingEntries = getEntriesForDate(date);
    existingEntries.forEach(entry => onDeleteEntry(entry));

    // Mark day as not worked without requiring a reason
    onMarkDayNotWorked(date);
  };

  const handleSubmit = () => {
    if (selectedDate && startTime && endTime) {
      onAddEntry(selectedDate, startTime, endTime);
      setShowAddModal(false);
      setSelectedDate(null);
    }
  };

  const getEntriesForDate = (date: Date): TimeEntry[] => {
    return entries.filter((entry) => {
      const entryDate = new Date(entry.startTime);
      return (
        entryDate.getDate() === date.getDate() &&
        entryDate.getMonth() === date.getMonth() &&
        entryDate.getFullYear() === date.getFullYear() &&
        !entry.isDeleted
      );
    });
  };

  const isDayNotWorked = (date: Date): boolean => {
    const dayEntries = getEntriesForDate(date);
    return dayEntries.some(entry => entry.notWorked);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
        {weekDates.map((date) => {
          const dayEntries = getEntriesForDate(date);
          const notWorked = isDayNotWorked(date);
          const hasEntry = dayEntries.length > 0;
          
          return (
            <div
              key={date.toISOString()}
              className={`bg-white rounded-lg shadow-sm border ${
                notWorked ? 'border-rose-200' : 'border-slate-200'
              }`}
            >
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-slate-700">{formatDate(date)}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleNotWorkedClick(date)}
                      className="p-1 rounded-full hover:bg-slate-100"
                      title="Mark as not worked"
                    >
                      <Ban size={20} className="text-rose-400" />
                    </button>
                    <button
                      onClick={() => handleAddClick(date)}
                      className={`p-1 rounded-full hover:bg-slate-100 ${hasEntry ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={hasEntry}
                      title={hasEntry ? 'Only one entry per day allowed' : 'Add time entry'}
                    >
                      <Plus size={20} className="text-sky-400" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {notWorked ? (
                    <div className="bg-rose-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <p className="text-rose-600 text-sm">Not Worked</p>
                        <button
                          onClick={() => onDeleteEntry(dayEntries[0])}
                          className="p-1 rounded-full hover:bg-rose-100"
                        >
                          <Trash2 size={16} className="text-rose-500" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    dayEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="bg-slate-50 p-3 rounded-lg"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">
                            {new Date(entry.startTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                            {' - '}
                            {entry.endTime && new Date(entry.endTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <button
                            onClick={() => onDeleteEntry(entry)}
                            className="p-1 rounded-full hover:bg-slate-200"
                          >
                            <Trash2 size={16} className="text-rose-400" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Time Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-500/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw]">
            <h3 className="text-lg font-semibold mb-4 text-slate-700">Add Time Entry</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Start Time</label>
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 bg-white text-slate-600 focus:border-sky-400 focus:ring focus:ring-sky-200"
                >
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">End Time</label>
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2 bg-white text-slate-600 focus:border-sky-400 focus:ring focus:ring-sky-200"
                >
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 rounded-lg bg-sky-400 hover:bg-sky-500 text-white"
                >
                  Add Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};