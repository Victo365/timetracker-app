export interface TimeEntry {
  id: string;
  startTime: string;
  endTime: string | null;
  breaks: Break[];
  tags: string[];
  project?: string;
  client?: string;
  task?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
  deletedAt?: string;
  notWorked?: boolean;
  notWorkedReason?: string;
}

export interface SavedWeek {
  id: string;
  startDate: string;
  endDate: string;
  entries: TimeEntry[];
  totalHours: number;
  totalEarnings: number;
  createdAt: string;
  updatedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface Break {
  id: string;
  startTime: string;
  endTime: string | null;
  duration: number;
}

export interface UserSettings {
  id: string;
  email: string;
  name: string;
  theme: 'light' | 'dark';
  hourlyRate: number;
  emailVerified: boolean;
  createdAt?: string;
}

export type WeekStartDay = 'monday' | 'sunday';

export type Page = 'home' | 'weekly' | 'previous' | 'trash' | 'settings' | 'profile';

export type ThemeMode = 'light' | 'dark';