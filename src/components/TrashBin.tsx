import React from 'react';
import { TimeEntry, SavedWeek } from '../types';
import { Trash2, RefreshCw } from 'lucide-react';

interface TrashBinProps {
  deletedEntries: TimeEntry[];
  deletedWeeks: SavedWeek[];
  onRestoreEntry: (entry: TimeEntry) => void;
  onRestoreWeek: (weekId: string) => void;
  onEmptyTrash: () => void;
}

export const TrashBin: React.FC<TrashBinProps> = ({
  deletedEntries,
  deletedWeeks,
  onRestoreEntry,
  onRestoreWeek,
  onEmptyTrash,
}) => {
  const hasDeletedItems = deletedEntries.length > 0 || deletedWeeks.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-700">Trash Bin</h2>
        {hasDeletedItems && (
          <button
            onClick={onEmptyTrash}
            className="px-4 py-2 rounded-lg bg-rose-400 hover:bg-rose-500 text-white flex items-center space-x-2"
          >
            <Trash2 size={20} />
            <span>Empty Trash</span>
          </button>
        )}
      </div>

      {!hasDeletedItems ? (
        <div className="text-center py-8">
          <Trash2 size={48} className="mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500">Trash bin is empty</p>
        </div>
      ) : (
        <div className="space-y-8">
          {deletedWeeks.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Deleted Weeks</h3>
              {deletedWeeks.map((week) => (
                <div
                  key={week.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        Week of {new Date(week.startDate).toLocaleDateString()} to{' '}
                        {new Date(week.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Total Hours: {week.totalHours.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => onRestoreWeek(week.id)}
                      className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 flex items-center space-x-2"
                    >
                      <RefreshCw size={16} />
                      <span>Restore</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {deletedEntries.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Deleted Entries</h3>
              {deletedEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        {new Date(entry.startTime).toLocaleDateString()} -{' '}
                        {new Date(entry.startTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {' to '}
                        {entry.endTime &&
                          new Date(entry.endTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                      </p>
                      {entry.project && (
                        <p className="text-sm text-gray-500">Project: {entry.project}</p>
                      )}
                    </div>
                    <button
                      onClick={() => onRestoreEntry(entry)}
                      className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 flex items-center space-x-2"
                    >
                      <RefreshCw size={16} />
                      <span>Restore</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};