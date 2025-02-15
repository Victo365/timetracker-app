import React from 'react';
import { Calendar, Archive, Trash2, Settings, User } from 'lucide-react';
import { Page } from '../types';

interface NavigationProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange }) => {
  const navItems = [
    { id: 'weekly' as Page, icon: Calendar, label: 'Current Week' },
    { id: 'previous' as Page, icon: Archive, label: 'Previous Weeks' },
    { id: 'profile' as Page, icon: User, label: 'Profile' },
    { id: 'trash' as Page, icon: Trash2, label: 'Trash Bin' },
    { id: 'settings' as Page, icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="space-y-2">
      {navItems.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => onPageChange(id)}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
            ${currentPage === id
              ? 'bg-sky-50 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'
            }`}
        >
          <Icon size={20} />
          <span className="font-medium">{label}</span>
        </button>
      ))}
    </nav>
  );
};