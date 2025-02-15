import React from 'react';
import { UserSettings } from '../types';
import { Clock, Calendar, BarChart as ChartBar, Settings, HelpCircle } from 'lucide-react';

interface WelcomeProps {
  settings: UserSettings;
}

export const Welcome: React.FC<WelcomeProps> = ({ settings }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleRestartTutorial = () => {
    localStorage.removeItem('hasSeenTutorial');
    window.location.reload();
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-sky-400 to-sky-500 rounded-xl p-8 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {getGreeting()}, {settings.name}!
            </h1>
            <p className="text-sky-100">
              Welcome to your time tracking dashboard. Let's make every minute count.
            </p>
          </div>
          <button
            onClick={handleRestartTutorial}
            className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            <HelpCircle size={20} />
            <span>Restart Tutorial</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <Clock className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-700">Track Time</h3>
              <p className="text-sm text-slate-500">Log your daily work hours</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-violet-100 rounded-lg">
              <Calendar className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-700">View Weeks</h3>
              <p className="text-sm text-slate-500">Review previous entries</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <ChartBar className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-700">Earnings</h3>
              <p className="text-sm text-slate-500">Track your income</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-rose-100 rounded-lg">
              <Settings className="h-6 w-6 text-rose-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-700">Settings</h3>
              <p className="text-sm text-slate-500">Customize your account</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-700 mb-4">Quick Tips</h2>
        <div className="space-y-3">
          <p className="text-slate-600">
            • Use the navigation menu on the left to access different sections
          </p>
          <p className="text-slate-600">
            • Don't forget to save your week after logging time entries
          </p>
          <p className="text-slate-600">
            • You can mark days as "not worked" when you're off
          </p>
          <p className="text-slate-600">
            • Check the Previous Weeks section to review and edit past entries
          </p>
        </div>
      </div>
    </div>
  );
};