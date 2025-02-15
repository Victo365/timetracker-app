import React, { useState } from 'react';
import { UserSettings } from '../types';
import { User, Mail, Calendar, Clock, RefreshCw } from 'lucide-react';
import { auth } from '../firebase';
import { sendEmailVerification } from 'firebase/auth';

interface ProfileProps {
  settings: UserSettings;
}

export const Profile: React.FC<ProfileProps> = ({ settings }) => {
  const [verificationSent, setVerificationSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const joinDate = new Date(settings.createdAt || Date.now());

  const handleSendVerification = async () => {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setVerificationSent(true);
        setError(null);
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200">Profile</h2>

      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 rounded-full bg-sky-100 dark:bg-sky-900 flex items-center justify-center">
            <span className="text-3xl font-bold text-sky-600 dark:text-sky-400">
              {settings.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">
              {settings.name}
            </h3>
            <p className="text-slate-500 dark:text-slate-400">{settings.email}</p>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">
            Account Information
          </h4>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <User className="text-slate-400" size={20} />
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Name</p>
                <p className="font-medium text-slate-700 dark:text-slate-200">{settings.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="text-slate-400" size={20} />
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Email</p>
                <p className="font-medium text-slate-700 dark:text-slate-200">{settings.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="text-slate-400" size={20} />
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Member Since</p>
                <p className="font-medium text-slate-700 dark:text-slate-200">
                  {joinDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">
            Work Information
          </h4>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Clock className="text-slate-400" size={20} />
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Hourly Rate</p>
                <p className="font-medium text-slate-700 dark:text-slate-200">
                  €{settings.hourlyRate.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-1 rounded bg-emerald-100 dark:bg-emerald-900">
                  <div className="w-5 h-5 flex items-center justify-center">
                    {settings.emailVerified ? (
                      <span className="text-emerald-600 dark:text-emerald-400">✓</span>
                    ) : (
                      <span className="text-rose-600 dark:text-rose-400">✗</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Email Status</p>
                  <p className="font-medium text-slate-700 dark:text-slate-200">
                    {settings.emailVerified ? 'Verified' : 'Not Verified'}
                  </p>
                </div>
              </div>
              {!settings.emailVerified && (
                <button
                  onClick={handleSendVerification}
                  disabled={verificationSent}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw size={16} className={verificationSent ? 'animate-spin' : ''} />
                  <span>{verificationSent ? 'Email Sent' : 'Verify Email'}</span>
                </button>
              )}
            </div>
            {error && (
              <p className="text-sm text-rose-500 mt-2">{error}</p>
            )}
            {verificationSent && !error && (
              <p className="text-sm text-emerald-500 mt-2">
                Verification email sent! Please check your inbox and click the verification link.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};