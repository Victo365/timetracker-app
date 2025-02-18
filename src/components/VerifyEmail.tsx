import React, { useState, useEffect } from 'react';
import { UserSettings } from '../types';
import { Mail, RefreshCw, Loader, AlertCircle } from 'lucide-react';
import { auth } from '../firebase';
import { sendEmailVerification } from 'firebase/auth';

interface VerifyEmailProps {
  settings: UserSettings | null;
}

export const VerifyEmail: React.FC<VerifyEmailProps> = ({ settings }) => {
  const [verificationSent, setVerificationSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const COOLDOWN_DURATION = 60; // 60 seconds cooldown

  useEffect(() => {
    let interval: NodeJS.Timeout;

    // Start checking for email verification
    if (auth.currentUser) {
      interval = setInterval(async () => {
        setChecking(true);
        try {
          await auth.currentUser?.reload();
          if (auth.currentUser?.emailVerified) {
            window.location.reload(); // Reload the app when verified
          }
        } catch (error) {
          console.error('Error checking verification status:', error);
        } finally {
          setChecking(false);
        }
      }, 3000); // Check every 3 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (cooldown > 0) {
      interval = setInterval(() => {
        setCooldown(prev => Math.max(0, prev - 1));
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [cooldown]);

  // Load the last send time from localStorage
  useEffect(() => {
    const lastSendTime = localStorage.getItem('lastVerificationEmailSent');
    if (lastSendTime) {
      const timeSinceLastSend = Math.floor((Date.now() - parseInt(lastSendTime)) / 1000);
      if (timeSinceLastSend < COOLDOWN_DURATION) {
        setCooldown(COOLDOWN_DURATION - timeSinceLastSend);
      }
    }
  }, []);

  const handleResendVerification = async () => {
    if (cooldown > 0) {
      setError(`Please wait ${cooldown} seconds before requesting another verification email.`);
      return;
    }

    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setVerificationSent(true);
        setError(null);
        setCooldown(COOLDOWN_DURATION);
        localStorage.setItem('lastVerificationEmailSent', Date.now().toString());
      }
    } catch (error: any) {
      if (error.code === 'auth/too-many-requests') {
        setError('Too many verification emails sent. Please wait a while before trying again.');
        setCooldown(COOLDOWN_DURATION);
      } else {
        setError(error.message);
      }
    }
  };

  const userEmail = settings?.email || auth.currentUser?.email || 'your email';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-sky-100 dark:bg-sky-900 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-sky-600 dark:text-sky-400" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-slate-700 dark:text-white">
            Verify Your Email
          </h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Please verify your email address to continue using the app
          </p>
        </div>

        <div className="bg-sky-50 dark:bg-sky-900/50 p-4 rounded-lg">
          <p className="text-sky-700 dark:text-sky-300 text-sm">
            A verification email has been sent to <strong>{userEmail}</strong>. 
            Please check your inbox and click the verification link.
          </p>
        </div>

        {checking && (
          <div className="flex items-center justify-center space-x-2 text-sky-600 dark:text-sky-400">
            <Loader className="animate-spin" size={20} />
            <span>Checking verification status...</span>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 dark:bg-rose-900/50 p-4 rounded-lg flex items-start space-x-3">
            <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={20} />
            <p className="text-rose-700 dark:text-rose-300 text-sm">{error}</p>
          </div>
        )}

        {verificationSent && !error && (
          <div className="bg-emerald-50 dark:bg-emerald-900/50 p-4 rounded-lg">
            <p className="text-emerald-700 dark:text-emerald-300 text-sm">
              Verification email sent! Please check your inbox.
            </p>
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={handleResendVerification}
            disabled={cooldown > 0 || verificationSent}
            className="flex items-center space-x-2 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={20} className={verificationSent ? 'animate-spin' : ''} />
            <span>
              {cooldown > 0
                ? `Wait ${cooldown}s to resend`
                : verificationSent
                ? 'Email Sent'
                : 'Resend Verification Email'}
            </span>
          </button>
        </div>

        <div className="text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Didn't receive the email? Check your spam folder or wait for the cooldown to expire.
          </p>
        </div>
      </div>
    </div>
  );
};