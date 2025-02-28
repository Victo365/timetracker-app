import React, { useState, useEffect } from 'react';
import { TimeEntry, SavedWeek } from '../types';
import { Trash2, RefreshCw, AlertTriangle, Clock } from 'lucide-react';

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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [displayedEntries, setDisplayedEntries] = useState<TimeEntry[]>(deletedEntries);
  const [displayedWeeks, setDisplayedWeeks] = useState<SavedWeek[]>(deletedWeeks);
  const [error, setError] = useState<string | null>(null);
  const hasDeletedItems = displayedEntries.length > 0 || displayedWeeks.length > 0;

  // Update displayed items when props change, but only if we're not showing the confirm dialog
  useEffect(() => {
    if (!showConfirmDialog) {
      setDisplayedEntries(deletedEntries);
      setDisplayedWeeks(deletedWeeks);
    }
  }, [deletedEntries, deletedWeeks, showConfirmDialog]);

  const calculateDaysRemaining = (deletedAt: string): number => {
    const deleteDate = new Date(deletedAt);
    const thirtyDaysLater = new Date(deleteDate);
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
    
    const now = new Date();
    const remainingTime = thirtyDaysLater.getTime() - now.getTime();
    return Math.ceil(remainingTime / (1000 * 60 * 60 * 24));
  };

  const formatTimeRemaining = (days: number): string => {
    if (days <= 0) return 'Deletion pending';
    if (days === 1) return '1 day remaining';
    return `${days} days remaining`;
  };

  const handleEmptyTrash = () => {
    setShowConfirmDialog(true);
  };

  const confirmEmptyTrash = () => {
    setDisplayedEntries([]);
    setDisplayedWeeks([]);
    setShowConfirmDialog(false);
    onEmptyTrash();
  };

  const handleRestoreEntry = async (entry: TimeEntry) => {
    try {
      setError(null);
      setDisplayedEntries(entries => entries.filter(e => e.id !== entry.id));
      onRestoreEntry(entry);
    } catch (error: any) {
      console.error('Error restoring entry:', error);
      setError(`Failed to restore entry: ${error.message || 'Unknown error'}`);
    }
  };

  const handleRestoreWeek = async (weekId: string) => {
    try {
      setError(null);
      setDisplayedWeeks(weeks => weeks.filter(w => w.id !== weekId));
      onRestoreWeek(weekId);
    } catch (error: any) {
      console.error('Error restoring week:', error);
      setError(`Failed to restore week: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-700 dark:text-slate-200">
            Trash Bin
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Items are automatically deleted after 30 days
          </p>
        </div>
        {hasDeletedItems && (
          <button
            onClick={handleEmptyTrash}
            className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white flex items-center space-x-2 transition-colors"
          >
            <Trash2 size={20} />
            <span>Empty Trash</span>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-900/30 border-l-4 border-rose-500 p-4 mb-4 rounded">
          <p className="text-rose-700 dark:text-rose-300">{error}</p>
        </div>
      )}

      {!hasDeletedItems ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <Trash2 size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <p className="text-slate-500 dark:text-slate-400">Trash bin is empty</p>
        </div>
      ) : (
        <div className="space-y-8">
          {displayedWeeks.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200">Deleted Weeks</h3>
              <div className="space-y-3">
                {displayedWeeks.map((week) => (
                  <div
                    key={week.id}
                    className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4 transition-all duration-200"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-slate-700 dark:text-slate-200">
                          Week of {new Date(week.startDate).toLocaleDateString()} to{' '}
                          {new Date(week.endDate).toLocaleDateString()}
                        </p>
                        <div className="flex items-center space-x-4">
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Total Hours: {week.totalHours.toFixed(2)}
                          </p>
                          {week.deletedAt && (
                            <p className="text-sm flex items-center text-amber-500">
                              <Clock size={14} className="mr-1" />
                              {formatTimeRemaining(calculateDaysRemaining(week.deletedAt))}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRestoreWeek(week.id)}
                        className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white flex items-center space-x-2 transition-colors"
                      >
                        <RefreshCw size={16} />
                        <span>Restore</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {displayedEntries.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200">Deleted Entries</h3>
              <div className="space-y-3">
                {displayedEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4 transition-all duration-200"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-slate-700 dark:text-slate-200">
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
                        <div className="flex items-center space-x-4">
                          {entry.project && (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              Project: {entry.project}
                            </p>
                          )}
                          {entry.deletedAt && (
                            <p className="text-sm flex items-center text-amber-500">
                              <Clock size={14} className="mr-1" />
                              {formatTimeRemaining(calculateDaysRemaining(entry.deletedAt))}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRestoreEntry(entry)}
                        className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white flex items-center space-x-2 transition-colors"
                      >
                        <RefreshCw size={16} />
                        <span>Restore</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center space-x-3 text-rose-500">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-semibold">Empty Trash?</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mt-3 mb-6">
              This action cannot be undone. All items in the trash will be permanently deleted.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmEmptyTrash}
                className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white flex items-center space-x-2 transition-colors"
              >
                <Trash2 size={16} />
                <span>Delete Forever</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};