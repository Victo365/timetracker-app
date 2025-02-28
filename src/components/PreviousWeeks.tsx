import React, { useState } from 'react';
import { SavedWeek, TimeEntry, UserSettings } from '../types';
import { formatDate, calculateDailyHours } from '../utils/timeUtils';
import { Calendar, Edit2, Trash2, Euro } from 'lucide-react';

interface PreviousWeeksProps {
  savedWeeks: SavedWeek[];
  onEditWeek: (weekId: string, updatedEntries: TimeEntry[]) => void;
  onDeleteWeek: (weekId: string) => void;
  settings: UserSettings; // Add settings prop
}

export const PreviousWeeks: React.FC<PreviousWeeksProps> = ({
  savedWeeks,
  onEditWeek,
  onDeleteWeek,
  settings,
}) => {
  const [editingWeek, setEditingWeek] = useState<string | null>(null);
  const [editedEntries, setEditedEntries] = useState<TimeEntry[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleEditClick = (week: SavedWeek) => {
    setEditingWeek(week.id);
    setEditedEntries([...week.entries]);
  };

  const handleSaveEdit = (weekId: string) => {
    onEditWeek(weekId, editedEntries);
    setEditingWeek(null);
  };

  const handleTimeChange = (date: Date, field: 'startTime' | 'endTime', value: string) => {
    const [hours, minutes] = value.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0);

    const existingEntry = editedEntries.find(entry => {
      const entryDate = new Date(entry.startTime);
      return (
        entryDate.getDate() === date.getDate() &&
        entryDate.getMonth() === date.getMonth() &&
        entryDate.getFullYear() === date.getFullYear()
      );
    });

    if (existingEntry) {
      setEditedEntries(entries =>
        entries.map(entry => {
          if (entry.id === existingEntry.id) {
            return {
              ...entry,
              [field]: newDate.toISOString(),
              notWorked: false,
              notWorkedReason: ''
            };
          }
          return entry;
        })
      );
    } else {
      // Create a new entry if none exists
      const newEntry: TimeEntry = {
        id: crypto.randomUUID(),
        startTime: field === 'startTime' ? newDate.toISOString() : date.toISOString(),
        endTime: field === 'endTime' ? newDate.toISOString() : date.toISOString(),
        breaks: [],
        tags: [],
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDeleted: false
      };
      setEditedEntries([...editedEntries, newEntry]);
    }
  };

  const handleNotWorkedChange = (date: Date, reason: string) => {
    const existingEntry = editedEntries.find(entry => {
      const entryDate = new Date(entry.startTime);
      return (
        entryDate.getDate() === date.getDate() &&
        entryDate.getMonth() === date.getMonth() &&
        entryDate.getFullYear() === date.getFullYear()
      );
    });

    if (existingEntry) {
      setEditedEntries(entries =>
        entries.map(entry =>
          entry.id === existingEntry.id
            ? { ...entry, notWorked: true, notWorkedReason: reason }
            : entry
        )
      );
    } else {
      const newEntry: TimeEntry = {
        id: crypto.randomUUID(),
        startTime: date.toISOString(),
        endTime: null,
        breaks: [],
        tags: [],
        isActive: false,
        notWorked: true,
        notWorkedReason: reason,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDeleted: false
      };
      setEditedEntries([...editedEntries, newEntry]);
    }
  };

  const handleDeleteEntry = (date: Date) => {
    setEditedEntries(entries =>
      entries.filter(entry => {
        const entryDate = new Date(entry.startTime);
        return !(
          entryDate.getDate() === date.getDate() &&
          entryDate.getMonth() === date.getMonth() &&
          entryDate.getFullYear() === date.getFullYear()
        );
      })
    );
  };

  const getEntriesForDate = (entries: TimeEntry[], date: Date) => {
    return entries.filter(entry => {
      const entryDate = new Date(entry.startTime);
      return (
        entryDate.getDate() === date.getDate() &&
        entryDate.getMonth() === date.getMonth() &&
        entryDate.getFullYear() === date.getFullYear()
      );
    });
  };

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
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Filter out deleted weeks
  const visibleWeeks = savedWeeks.filter(week => !week.isDeleted);
  
  // Sort weeks from most recent to oldest
  const sortedWeeks = [...visibleWeeks].sort((a, b) => {
    const dateA = new Date(a.startDate);
    const dateB = new Date(b.startDate);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="space-y-8">
      <h2 className="text-xl sm:text-2xl font-bold text-slate-700 mb-6">Previous Weeks</h2>
      
      {sortedWeeks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Calendar size={48} className="mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500">No saved weeks yet</p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedWeeks.map((week) => (
            <div
              key={week.id}
              className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-sky-400 to-sky-500 p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Week of {new Date(week.startDate).toLocaleDateString()} to{' '}
                      {new Date(week.endDate).toLocaleDateString()}
                    </h3>
                    <p className="text-sm text-white/90">
                      Total Hours: {week.totalHours.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditClick(week)}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() => onDeleteWeek(week.id)}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-4 overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="text-left border-b border-slate-200">
                      <th className="py-2 px-4 font-semibold text-slate-600">Day</th>
                      <th className="py-2 px-4 font-semibold text-slate-600">Date</th>
                      <th className="py-2 px-4 font-semibold text-slate-600">Hours</th>
                      <th className="py-2 px-4 font-semibold text-slate-600">Time Range</th>
                      <th className="py-2 px-4 font-semibold text-slate-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {daysOfWeek.map((day, index) => {
                      const date = new Date(week.startDate);
                      date.setDate(date.getDate() + index);
                      const entries = editingWeek === week.id
                        ? getEntriesForDate(editedEntries, date)
                        : getEntriesForDate(week.entries, date);
                      const dailyHours = calculateDailyHours(entries);
                      const notWorkedEntry = entries.find(entry => entry.notWorked);

                      return (
                        <tr key={day} className="border-b border-slate-200 last:border-0">
                          <td className="py-3 px-4">
                            <span className="font-medium">{day}</span>
                          </td>
                          <td className="py-3 px-4">
                            {date.getDate()}
                          </td>
                          <td className="py-3 px-4">
                            {dailyHours.toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            {editingWeek === week.id ? (
                              notWorkedEntry ? (
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="text"
                                    value={notWorkedEntry.notWorkedReason || ''}
                                    onChange={(e) => handleNotWorkedChange(date, e.target.value)}
                                    className="p-1 rounded border border-slate-200 bg-white text-slate-900 w-full"
                                    placeholder="Reason for not working..."
                                  />
                                  <button
                                    onClick={() => handleDeleteEntry(date)}
                                    className="p-1 rounded bg-rose-100 text-rose-600 hover:bg-rose-200"
                                  >
                                    Clear
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-2">
                                  <select
                                    value={entries[0]?.startTime ? new Date(entries[0].startTime).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: false
                                    }) : '09:00'}
                                    onChange={(e) => handleTimeChange(date, 'startTime', e.target.value)}
                                    className="p-1 rounded border border-slate-200 bg-white text-slate-900"
                                  >
                                    {timeOptions.map(time => (
                                      <option key={time} value={time}>{time}</option>
                                    ))}
                                  </select>
                                  <span>-</span>
                                  <select
                                    value={entries[0]?.endTime ? new Date(entries[0].endTime).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: false
                                    }) : '17:00'}
                                    onChange={(e) => handleTimeChange(date, 'endTime', e.target.value)}
                                    className="p-1 rounded border border-slate-200 bg-white text-slate-900"
                                  >
                                    {timeOptions.map(time => (
                                      <option key={time} value={time}>{time}</option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={() => handleNotWorkedChange(date, '')}
                                    className="p-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200"
                                  >
                                    Mark Not Worked
                                  </button>
                                  {entries.length > 0 && (
                                    <button
                                      onClick={() => handleDeleteEntry(date)}
                                      className="p-1 rounded bg-rose-100 text-rose-600 hover:bg-rose-200"
                                    >
                                      Clear
                                    </button>
                                  )}
                                </div>
                              )
                            ) : (
                              entries.map((entry, i) => (
                                <div key={entry.id} className="text-sm mb-1 last:mb-0">
                                  {entry.notWorked ? (
                                    <span className="text-rose-500">Not worked: {entry.notWorkedReason}</span>
                                  ) : (
                                    <>
                                      {new Date(entry.startTime).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                      {' - '}
                                      {entry.endTime && new Date(entry.endTime).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </>
                                  )}
                                </div>
                              ))
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {notWorkedEntry ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                                Not Worked
                              </span>
                            ) : dailyHours > 0 ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Worked
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                No Entry
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-slate-50">
                    <tr>
                      <td colSpan={2} className="py-3 px-4 font-semibold text-slate-700">
                        Total Week Hours
                      </td>
                      <td colSpan={3} className="py-3 px-4 font-semibold text-sky-500">
                        {week.totalHours.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="py-3 px-4 font-semibold text-slate-700">
                        <div className="flex items-center space-x-2">
                          <Euro size={20} className="text-emerald-500" />
                          <span>Total to Receive</span>
                        </div>
                      </td>
                      <td colSpan={3} className="py-3 px-4 font-semibold text-emerald-500">
                        €{(week.totalHours * settings.hourlyRate).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
                {editingWeek === week.id && (
                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      onClick={() => setEditingWeek(null)}
                      className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit(week.id)}
                      className="px-4 py-2 rounded-lg bg-sky-400 hover:bg-sky-500 text-white"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};