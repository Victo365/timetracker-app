import React, { useState } from 'react';
import { UserSettings } from '../types';
import { Mail, Lock, Trash2, Sun, Moon, LogOut, Shield, Euro } from 'lucide-react';
import { auth } from '../firebase';
import { signOut, EmailAuthProvider, reauthenticateWithCredential, verifyBeforeUpdateEmail } from 'firebase/auth';

interface SettingsProps {
  settings: UserSettings;
  onUpdateEmail: (newEmail: string) => Promise<void>;
  onUpdatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  onDeleteAccount: (password: string) => Promise<void>;
  onToggleTheme: () => void;
  onUpdateName: (newName: string) => void;
  onUpdateHourlyRate: (newRate: number) => Promise<void>;
}

export const Settings: React.FC<SettingsProps> = ({
  settings,
  onUpdateEmail,
  onUpdatePassword,
  onDeleteAccount,
  onToggleTheme,
  onUpdateName,
  onUpdateHourlyRate,
}) => {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showHourlyRateModal, setShowHourlyRateModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [newName, setNewName] = useState(settings.name);
  const [newHourlyRate, setNewHourlyRate] = useState(settings.hourlyRate.toString());
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [verificationPassword, setVerificationPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const verifyPassword = async (password: string) => {
    if (!auth.currentUser?.email) return false;
    
    try {
      const credential = EmailAuthProvider.credential(auth.currentUser.email, password);
      await reauthenticateWithCredential(auth.currentUser, credential);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleEmailUpdate = async () => {
    setIsVerifying(true);
    setError(null);
    
    try {
      const isVerified = await verifyPassword(verificationPassword);
      if (!isVerified) {
        setError('Incorrect password. Please try again.');
        return;
      }

      if (!auth.currentUser) {
        throw new Error('No user is currently signed in');
      }

      // Send verification email to the new email address
      await verifyBeforeUpdateEmail(auth.currentUser, newEmail);
      setVerificationEmailSent(true);
      setSuccess('Verification email sent to your new email address. Please check your inbox and verify before the change takes effect.');
      
      // Don't close the modal yet, show verification sent message
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        setError('Please sign out and sign in again before changing your email.');
      } else {
        setError(error.message);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const isVerified = await verifyPassword(currentPassword);
      if (!isVerified) {
        setError('Current password is incorrect. Please try again.');
        return;
      }

      await onUpdatePassword(currentPassword, newPassword);
      setSuccess('Password updated successfully!');
      setShowPasswordModal(false);
      resetForm();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleNameUpdate = async () => {
    try {
      await onUpdateName(newName);
      setSuccess('Name updated successfully!');
      setShowNameModal(false);
      resetForm();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleHourlyRateUpdate = async () => {
    try {
      const rate = parseFloat(newHourlyRate);
      if (isNaN(rate) || rate <= 0) {
        setError('Please enter a valid hourly rate');
        return;
      }
      await onUpdateHourlyRate(rate);
      setSuccess('Hourly rate updated successfully!');
      setShowHourlyRateModal(false);
      resetForm();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleDeleteAccount = async () => {
    setIsVerifying(true);
    setError(null);

    try {
      const isVerified = await verifyPassword(deletePassword);
      if (!isVerified) {
        setError('Incorrect password. Please try again.');
        return;
      }

      await onDeleteAccount(deletePassword);
      setSuccess('Account deleted successfully!');
      setShowDeleteModal(false);
      resetForm();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const resetForm = () => {
    setNewEmail('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setDeletePassword('');
    setNewName(settings.name);
    setNewHourlyRate(settings.hourlyRate.toString());
    setVerificationPassword('');
    setError(null);
    setIsVerifying(false);
    setVerificationEmailSent(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-slate-700">Settings</h2>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>

      <div className="space-y-6">
        {/* Theme Toggle */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {settings.theme === 'dark' ? (
                <Moon className="text-slate-600" size={24} />
              ) : (
                <Sun className="text-slate-600" size={24} />
              )}
              <div>
                <h3 className="text-lg font-medium text-slate-700">Theme</h3>
                <p className="text-sm text-slate-500">Switch between light and dark mode</p>
              </div>
            </div>
            <button
              onClick={onToggleTheme}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
            >
              {settings.theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            </button>
          </div>
        </div>

        {/* Hourly Rate Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Euro className="text-emerald-600" size={24} />
              <div>
                <h3 className="text-lg font-medium text-slate-700">Hourly Rate</h3>
                <p className="text-sm text-slate-500">€{settings.hourlyRate.toFixed(2)} per hour</p>
              </div>
            </div>
            <button
              onClick={() => setShowHourlyRateModal(true)}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              Update Rate
            </button>
          </div>
        </div>

        {/* Name Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full bg-sky-100 text-sky-600">
                {settings.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-medium text-slate-700">Name</h3>
                <p className="text-sm text-slate-500">{settings.name}</p>
              </div>
            </div>
            <button
              onClick={() => setShowNameModal(true)}
              className="px-4 py-2 rounded-lg bg-sky-400 hover:bg-sky-500 text-white"
            >
              Change Name
            </button>
          </div>
        </div>

        {/* Email Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Mail className="text-slate-600" size={24} />
              <div>
                <h3 className="text-lg font-medium text-slate-700">Email</h3>
                <p className="text-sm text-slate-500">{settings.email}</p>
              </div>
            </div>
            <button
              onClick={() => setShowEmailModal(true)}
              className="px-4 py-2 rounded-lg bg-sky-400 hover:bg-sky-500 text-white"
            >
              Change Email
            </button>
          </div>
        </div>

        {/* Password Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Lock className="text-slate-600" size={24} />
              <div>
                <h3 className="text-lg font-medium text-slate-700">Password</h3>
                <p className="text-sm text-slate-500">Change your account password</p>
              </div>
            </div>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="px-4 py-2 rounded-lg bg-sky-400 hover:bg-sky-500 text-white"
            >
              Change Password
            </button>
          </div>
        </div>

        {/* Delete Account */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Trash2 className="text-rose-500" size={24} />
              <div>
                <h3 className="text-lg font-medium text-slate-700">Delete Account</h3>
                <p className="text-sm text-slate-500">Permanently delete your account and all data</p>
              </div>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Hourly Rate Modal */}
      {showHourlyRateModal && (
        <div className="fixed inset-0 bg-slate-500/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[480px] max-w-[90vw]">
            <h3 className="text-lg font-semibold mb-4 text-slate-700">Update Hourly Rate</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Hourly Rate (€)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={newHourlyRate}
                    onChange={(e) => setNewHourlyRate(e.target.value)}
                    step="0.01"
                    min="0"
                    className="w-full rounded-lg border border-slate-200 p-2 pr-10"
                    placeholder="Enter hourly rate"
                  />
                  <Euro className="absolute right-3 top-2.5 text-slate-400" size={20} />
                </div>
              </div>
              {error && (
                <p className="text-sm text-rose-500">{error}</p>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowHourlyRateModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleHourlyRateUpdate}
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  Update Rate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Name Change Modal */}
      {showNameModal && (
        <div className="fixed inset-0 bg-slate-500/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[480px] max-w-[90vw]">
            <h3 className="text-lg font-semibold mb-4 text-slate-700">Change Name</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">New Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2"
                  placeholder="Enter new name"
                />
              </div>
              {error && (
                <p className="text-sm text-rose-500">{error}</p>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowNameModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleNameUpdate}
                  className="px-4 py-2 rounded-lg bg-sky-400 hover:bg-sky-500 text-white"
                >
                  Update Name
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Change Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-slate-500/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[480px] max-w-[90vw]">
            <h3 className="text-lg font-semibold mb-4 text-slate-700">Change Email</h3>
            <div className="space-y-4">
              {!verificationEmailSent ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">New Email</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 p-2"
                      placeholder="Enter new email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">
                      Verify Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={verificationPassword}
                        onChange={(e) => setVerificationPassword(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 p-2 pr-10"
                        placeholder="Enter your password"
                      />
                      <Shield className="absolute right-3 top-2.5 text-slate-400" size={20} />
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <Mail className="mx-auto text-sky-500 mb-4" size={48} />
                  <p className="text-slate-600">
                    A verification email has been sent to {newEmail}. Please check your inbox and click the verification link to complete the email change.
                  </p>
                </div>
              )}
              {error && (
                <p className="text-sm text-rose-500">{error}</p>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowEmailModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
                >
                  {verificationEmailSent ? 'Close' : 'Cancel'}
                </button>
                {!verificationEmailSent && (
                  <button
                    onClick={handleEmailUpdate}
                    disabled={isVerifying}
                    className="px-4 py-2 rounded-lg bg-sky-400 hover:bg-sky-500 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isVerifying && <Shield className="animate-pulse" size={20} />}
                    <span>{isVerifying ? 'Verifying...' : 'Update Email'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-slate-500/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[480px] max-w-[90vw]">
            <h3 className="text-lg font-semibold mb-4 text-slate-700">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 pr-10"
                    placeholder="Enter current password"
                  />
                  <Shield className="absolute right-3 top-2.5 text-slate-400" size={20} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 p-2"
                  placeholder="Confirm new password"
                />
              </div>
              {error && (
                <p className="text-sm text-rose-500">{error}</p>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordUpdate}
                  disabled={isVerifying}
                  className="px-4 py-2 rounded-lg bg-sky-400 hover:bg-sky-500 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isVerifying && <Shield className="animate-pulse" size={20} />}
                  <span>{isVerifying ? 'Verifying...' : 'Update Password'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-500/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[480px] max-w-[90vw]">
            <h3 className="text-lg font-semibold mb-4 text-slate-700">Delete Account</h3>
            <div className="space-y-4">
              <p className="text-slate-600">
                This action cannot be undone. All your data will be permanently deleted.
              </p>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Enter your password to confirm
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 pr-10"
                    placeholder="Enter password"
                  />
                  <Shield className="absolute right-3 top-2.5 text-slate-400" size={20} />
                </div>
              </div>
              {error && (
                <p className="text-sm text-rose-500">{error}</p>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isVerifying}
                  className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isVerifying && <Shield className="animate-pulse" size={20} />}
                  <span>{isVerifying ? 'Verifying...' : 'Delete Account'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="fixed top-4 right-4 bg-green-50 border-l-4 border-green-400 text-green-700 p-4 rounded shadow-lg">
          {success}
        </div>
      )}
    </div>
  );
};