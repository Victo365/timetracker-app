import React, { useState, useEffect } from 'react';
import { WeeklyLog } from './components/WeeklyLog';
import { PreviousWeeks } from './components/PreviousWeeks';
import { TrashBin } from './components/TrashBin';
import { Settings } from './components/Settings';
import { Navigation } from './components/Navigation';
import { Auth } from './components/Auth';
import { Welcome } from './components/Welcome';
import { Tutorial } from './components/Tutorial';
import { Profile } from './components/Profile';
import { VerifyEmail } from './components/VerifyEmail';
import { TimeEntry, WeekStartDay, Page, SavedWeek, UserSettings, ThemeMode } from './types';
import { Clock, LayoutDashboard, Menu, X } from 'lucide-react';
import { calculateWeekHours, getWeekDates, isSameDay } from './utils/timeUtils';
import { db, auth } from './firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  setDoc, 
  writeBatch,
  getDoc 
} from 'firebase/firestore';
import { updateEmail, updatePassword, deleteUser } from 'firebase/auth';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [savedWeeks, setSavedWeeks] = useState<SavedWeek[]>([]);
  const [weekStartDay] = useState<WeekStartDay>('monday');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setIsAuthenticated(true);
        const userSettingsDoc = await getDoc(doc(db, 'userSettings', user.uid));
        if (userSettingsDoc.exists()) {
          const settings = userSettingsDoc.data() as UserSettings;
          settings.emailVerified = user.emailVerified;
          setUserSettings(settings);
          setTheme(settings.theme);
          
          if (settings.emailVerified !== user.emailVerified) {
            await updateDoc(doc(db, 'userSettings', user.uid), {
              emailVerified: user.emailVerified
            });
          }
        }
        fetchUserData(user.uid);
      } else {
        setIsAuthenticated(false);
        setUserSettings(null);
        setEntries([]);
        setSavedWeeks([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentPage]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      const entriesQuery = query(
        collection(db, 'entries'),
        where('userId', '==', userId),
        where('isDeleted', '==', false)
      );
      const entriesSnapshot = await getDocs(entriesQuery);
      const entriesData = entriesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as TimeEntry[];
      setEntries(entriesData);

      const weeksQuery = query(
        collection(db, 'savedWeeks'),
        where('userId', '==', userId),
        where('isDeleted', '==', false)
      );
      const weeksSnapshot = await getDocs(weeksQuery);
      const weeksData = weeksSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as SavedWeek[];
      setSavedWeeks(weeksData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleAddEntry = async (date: Date, startTime: string, endTime: string) => {
    try {
      if (!auth.currentUser) return;

      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);

      const startDate = new Date(date);
      startDate.setHours(startHour, startMinute, 0);

      const endDate = new Date(date);
      endDate.setHours(endHour, endMinute, 0);

      const newEntry: Omit<TimeEntry, 'id'> = {
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        breaks: [],
        tags: [],
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDeleted: false,
        userId: auth.currentUser.uid
      };

      const docRef = await addDoc(collection(db, 'entries'), newEntry);
      const entryWithId = { ...newEntry, id: docRef.id } as TimeEntry;
      setEntries(prev => [...prev, entryWithId]);
      setSuccessMessage('Entry added successfully!');
    } catch (error) {
      console.error('Error adding entry:', error);
    }
  };

  const handleDeleteEntry = async (entry: TimeEntry) => {
    try {
      await updateDoc(doc(db, 'entries', entry.id), {
        isDeleted: true,
        deletedAt: new Date().toISOString()
      });
      setEntries(prev => prev.filter(e => e.id !== entry.id));
      setSuccessMessage('Entry deleted successfully!');
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const handleMarkDayNotWorked = async (date: Date, reason?: string) => {
    try {
      if (!auth.currentUser) return;

      const newEntry: Omit<TimeEntry, 'id'> = {
        startTime: date.toISOString(),
        endTime: null,
        breaks: [],
        tags: [],
        isActive: false,
        notWorked: true,
        notWorkedReason: reason || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDeleted: false,
        userId: auth.currentUser.uid
      };

      const docRef = await addDoc(collection(db, 'entries'), newEntry);
      const entryWithId = { ...newEntry, id: docRef.id } as TimeEntry;
      setEntries(prev => [...prev, entryWithId]);
      setSuccessMessage('Day marked as not worked!');
    } catch (error) {
      console.error('Error marking day as not worked:', error);
    }
  };

  const handleEditWeek = async (weekId: string, updatedEntries: TimeEntry[]) => {
    try {
      setIsUpdating(true);
      const totalHours = calculateWeekHours(updatedEntries);
      const totalEarnings = totalHours * 12.70;

      await updateDoc(doc(db, 'savedWeeks', weekId), {
        entries: updatedEntries,
        totalHours,
        totalEarnings,
        updatedAt: new Date().toISOString()
      });

      setSavedWeeks(weeks => 
        weeks.map(week => week.id === weekId ? {
          ...week,
          entries: updatedEntries,
          totalHours,
          totalEarnings
        } : week)
      );
      setSuccessMessage('Week updated successfully!');
    } catch (error) {
      console.error('Error updating week:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteWeek = async (weekId: string) => {
    try {
      await updateDoc(doc(db, 'savedWeeks', weekId), {
        isDeleted: true,
        deletedAt: new Date().toISOString()
      });
      setSavedWeeks(prev => prev.filter(w => w.id !== weekId));
      setSuccessMessage('Week deleted successfully!');
    } catch (error) {
      console.error('Error deleting week:', error);
    }
  };

  const handleRestoreEntry = async (entry: TimeEntry) => {
    try {
      await updateDoc(doc(db, 'entries', entry.id), {
        isDeleted: false,
        deletedAt: null
      });
      setEntries(prev => [...prev, { ...entry, isDeleted: false }]);
      setSuccessMessage('Entry restored successfully!');
    } catch (error) {
      console.error('Error restoring entry:', error);
    }
  };

  const handleRestoreWeek = async (weekId: string) => {
    try {
      await updateDoc(doc(db, 'savedWeeks', weekId), {
        isDeleted: false,
        deletedAt: null
      });
      const weekDoc = await getDoc(doc(db, 'savedWeeks', weekId));
      if (weekDoc.exists()) {
        setSavedWeeks(prev => [...prev, { ...weekDoc.data(), id: weekId } as SavedWeek]);
      }
      setSuccessMessage('Week restored successfully!');
    } catch (error) {
      console.error('Error restoring week:', error);
    }
  };

  const handleEmptyTrash = async () => {
    try {
      if (!auth.currentUser) return;

      const batch = writeBatch(db);
      
      const deletedEntriesQuery = query(
        collection(db, 'entries'),
        where('userId', '==', auth.currentUser.uid),
        where('isDeleted', '==', true)
      );
      const deletedEntriesSnapshot = await getDocs(deletedEntriesQuery);
      deletedEntriesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      const deletedWeeksQuery = query(
        collection(db, 'savedWeeks'),
        where('userId', '==', auth.currentUser.uid),
        where('isDeleted', '==', true)
      );
      const deletedWeeksSnapshot = await getDocs(deletedWeeksQuery);
      deletedWeeksSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      setSuccessMessage('Trash emptied successfully!');
    } catch (error) {
      console.error('Error emptying trash:', error);
    }
  };

  const handleUpdateEmail = async (newEmail: string) => {
    try {
      if (!auth.currentUser || !userSettings) return;

      await updateEmail(auth.currentUser, newEmail);
      
      const updatedSettings = { ...userSettings, email: newEmail };
      await setDoc(doc(db, 'userSettings', auth.currentUser.uid), updatedSettings);
      setUserSettings(updatedSettings);
      
      setSuccessMessage('Email updated successfully!');
    } catch (error) {
      console.error('Error updating email:', error);
      throw error;
    }
  };

  const handleUpdatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      if (!auth.currentUser) return;

      await updatePassword(auth.currentUser, newPassword);
      setSuccessMessage('Password updated successfully!');
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  };

  const handleUpdateName = async (newName: string) => {
    try {
      if (!auth.currentUser || !userSettings) return;

      const updatedSettings = { ...userSettings, name: newName };
      await setDoc(doc(db, 'userSettings', auth.currentUser.uid), updatedSettings);
      setUserSettings(updatedSettings);
      
      setSuccessMessage('Name updated successfully!');
    } catch (error) {
      console.error('Error updating name:', error);
      throw error;
    }
  };

  const handleDeleteAccount = async (password: string) => {
    try {
      if (!auth.currentUser) return;

      const batch = writeBatch(db);
      
      const entriesQuery = query(collection(db, 'entries'));
      const entriesSnapshot = await getDocs(entriesQuery);
      entriesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      const weeksQuery = query(collection(db, 'savedWeeks'));
      const weeksSnapshot = await getDocs(weeksQuery);
      weeksSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      batch.delete(doc(db, 'userSettings', auth.currentUser.uid));

      await batch.commit();

      await deleteUser(auth.currentUser);
      
      setSuccessMessage('Account deleted successfully!');
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  };

  const handleToggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);

    if (auth.currentUser && userSettings) {
      try {
        const updatedSettings = { ...userSettings, theme: newTheme };
        await setDoc(doc(db, 'userSettings', auth.currentUser.uid), updatedSettings);
        setUserSettings(updatedSettings);
      } catch (error) {
        console.error('Error updating theme:', error);
      }
    }
  };

  const saveCurrentWeek = async () => {
    if (isUpdating) return;

    try {
      setIsUpdating(true);
      if (!auth.currentUser) return;

      const weekDates = getWeekDates(new Date(), weekStartDay);
      const startDate = weekDates[0];
      const endDate = weekDates[6];
      
      const existingWeek = savedWeeks.find((week) => {
        const weekStart = new Date(week.startDate);
        return isSameDay(weekStart, startDate) && !week.isDeleted;
      });

      const weekEntries = entries.filter((entry) => {
        const entryDate = new Date(entry.startTime);
        const entryTime = entryDate.getTime();
        const startTime = startDate.getTime();
        const endTime = new Date(endDate).setHours(23, 59, 59, 999);
        return entryTime >= startTime && entryTime <= endTime && !entry.isDeleted;
      });

      const totalHours = calculateWeekHours(weekEntries);
      const totalEarnings = totalHours * 12.70;

      if (existingWeek) {
        const updatedWeek = {
          ...existingWeek,
          entries: weekEntries,
          totalHours,
          totalEarnings,
          updatedAt: new Date().toISOString()
        };

        await setDoc(doc(db, 'savedWeeks', existingWeek.id), updatedWeek);
        setSavedWeeks(weeks => 
          weeks.map(week => week.id === existingWeek.id ? updatedWeek : week)
        );
      } else {
        const newWeek: Omit<SavedWeek, 'id'> = {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          entries: weekEntries,
          totalHours,
          totalEarnings,
          createdAt: new Date().toISOString(),
          isDeleted: false,
          userId: auth.currentUser.uid
        };

        const docRef = await addDoc(collection(db, 'savedWeeks'), newWeek);
        const weekWithId = { ...newWeek, id: docRef.id } as SavedWeek;
        setSavedWeeks(weeks => [weekWithId, ...weeks]);
      }

      setSuccessMessage('Week saved successfully!');
    } catch (error) {
      console.error('Error saving week:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300">
        {!isAuthenticated ? (
          <Auth onSuccess={() => setIsAuthenticated(true)} />
        ) : !userSettings?.emailVerified ? (
          <VerifyEmail settings={userSettings} />
        ) : (
          <>
            <Tutorial isAuthenticated={isAuthenticated} />
            
            <div className="md:hidden fixed top-4 right-4 z-50">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-lg"
              >
                {isMobileMenuOpen ? (
                  <X size={24} className="text-slate-600 dark:text-slate-300" />
                ) : (
                  <Menu size={24} className="text-slate-600 dark:text-slate-300" />
                )}
              </button>
            </div>
            
            {isMobileMenuOpen && (
              <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsMobileMenuOpen(false)} />
            )}
            
            <div
              className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 shadow-lg transform transition-transform duration-200 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0 md:static md:min-h-screen
                ${isMobileMenuOpen ? 'translate-x-0' : ''}
              `}
            >
              <div className="p-4">
                <div className="flex items-center space-x-3 mb-8">
                  <LayoutDashboard size={32} className="text-sky-400" />
                  <h1 className="text-xl font-bold text-slate-700 dark:text-white">
                    Time Tracker
                  </h1>
                </div>
                <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
              </div>
            </div>

            <div className={`transition-all duration-200 
              ${isSidebarOpen ? 'md:ml-64' : 'md:ml-0'}
              min-h-screen
            `}>
              <header className="bg-white dark:bg-slate-800 shadow-sm h-16 sticky top-0 z-30">
                <div className="h-full px-4 flex items-center justify-between max-w-7xl mx-auto">
                  <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 hidden md:block"
                  >
                    <Clock size={24} className="text-slate-500 dark:text-slate-400" />
                  </button>
                  
                  {currentPage === 'weekly' && (
                    <button
                      onClick={saveCurrentWeek}
                      disabled={isUpdating}
                      className="save-week-button px-4 py-2 bg-teal-400 hover:bg-teal-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-teal-500 dark:hover:bg-teal-600 ml-auto"
                    >
                      {isUpdating ? 'Saving...' : 'Save Week'}
                    </button>
                  )}
                </div>
              </header>

              {successMessage && (
                <div className="fixed top-4 right-4 bg-teal-50 dark:bg-teal-900 border-l-4 border-teal-400 text-teal-600 dark:text-teal-200 p-4 rounded shadow-lg z-50">
                  {successMessage}
                </div>
              )}

              <main className="p-4 sm:p-6 max-w-7xl mx-auto">
                {currentPage === 'home' && userSettings && (
                  <Welcome settings={userSettings} />
                )}

                {currentPage === 'weekly' && (
                  <WeeklyLog
                    entries={entries}
                    weekStartDay={weekStartDay}
                    onAddEntry={handleAddEntry}
                    onDeleteEntry={handleDeleteEntry}
                    onMarkDayNotWorked={handleMarkDayNotWorked}
                  />
                )}

                {currentPage === 'previous' && (
                  <PreviousWeeks
                    savedWeeks={savedWeeks}
                    onEditWeek={handleEditWeek}
                    onDeleteWeek={handleDeleteWeek}
                  />
                )}

                {currentPage === 'profile' && userSettings && (
                  <Profile settings={userSettings} />
                )}

                {currentPage === 'trash' && (
                  <TrashBin
                    deletedEntries={entries.filter(e => e.isDeleted)}
                    deletedWeeks={savedWeeks.filter(w => w.isDeleted)}
                    onRestoreEntry={handleRestoreEntry}
                    onRestoreWeek={handleRestoreWeek}
                    onEmptyTrash={handleEmptyTrash}
                  />
                )}

                {currentPage === 'settings' && userSettings && (
                  <Settings
                    settings={userSettings}
                    onUpdateEmail={handleUpdateEmail}
                    onUpdatePassword={handleUpdatePassword}
                    onDeleteAccount={handleDeleteAccount}
                    onToggleTheme={handleToggleTheme}
                    onUpdateName={handleUpdateName}
                  />
                )}
              </main>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;