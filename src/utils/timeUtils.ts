export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const calculateDuration = (start: string, end: string): number => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
};

export const getWeekDates = (date: Date, startDay: WeekStartDay): Date[] => {
  const current = new Date(date);
  
  // Reset time to midnight to ensure consistent date comparisons
  current.setHours(0, 0, 0, 0);
  
  // Get the current day (0-6, where 0 is Sunday)
  const currentDay = current.getDay();
  
  // Calculate how many days to subtract to get to the start of the week
  const daysToSubtract = startDay === 'monday' 
    ? currentDay === 0 ? 6 : currentDay - 1  // For Monday start
    : currentDay;                            // For Sunday start
  
  // Set date to the start of the current week
  current.setDate(current.getDate() - daysToSubtract);
  
  // Generate array of dates for the week
  const week: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const weekDate = new Date(current);
    weekDate.setDate(current.getDate() + i);
    week.push(weekDate);
  }
  
  return week;
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

export const calculateDailyHours = (entries: TimeEntry[]): number => {
  return entries.reduce((total, entry) => {
    if (entry.endTime) {
      return total + calculateDuration(entry.startTime, entry.endTime);
    }
    return total;
  }, 0);
};

export const calculateWeekHours = (entries: TimeEntry[]): number => {
  return entries.reduce((total, entry) => {
    if (entry.endTime) {
      return total + calculateDuration(entry.startTime, entry.endTime);
    }
    return total;
  }, 0);
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};