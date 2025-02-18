import React from 'react';
import { Calendar, Archive, Trash2, Settings, User, LogOut } from 'lucide-react';
import { Page } from '../types';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

interface NavigationProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  collapsed?: boolean;
  onMobileNavigate?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  currentPage, 
  onPageChange, 
  collapsed = false,
  onMobileNavigate 
}) => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleNavigation = (page: Page) => {
    onPageChange(page);
    if (window.innerWidth < 768 && onMobileNavigate) {
      onMobileNavigate();
    }
  };

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
          onClick={() => handleNavigation(id)}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
            ${currentPage === id
              ? 'bg-sky-50 text-sky-600 dark:bg-sky-900/50 dark:text-sky-400'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'
            }
            ${collapsed ? 'md:justify-center' : ''}
          `}
        >
          <Icon size={20} className="shrink-0" />
          <span className={`font-medium transition-opacity duration-300 ${collapsed ? 'md:hidden' : ''}`}>
            {label}
          </span>
        </button>
      ))}
      
      <button
        onClick={() => {
          handleLogout();
          if (window.innerWidth < 768 && onMobileNavigate) {
            onMobileNavigate();
          }
        }}
        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/50 mt-8
          ${collapsed ? 'md:justify-center' : ''}
        `}
      >
        <LogOut size={20} className="shrink-0" />
        <span className={`font-medium transition-opacity duration-300 ${collapsed ? 'md:hidden' : ''}`}>
          Logout
        </span>
      </button>
    </nav>
  );
};