import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserSettings } from '../types';
import { LogIn, UserPlus, Mail, Lock, User, ArrowLeft } from 'lucide-react';

interface AuthProps {
  mode: 'signin' | 'signup';
  onSuccess: () => void;
  onBackToLanding?: () => void;
}

export const Auth: React.FC<AuthProps> = ({ mode: initialMode, onSuccess, onBackToLanding }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const auth = getAuth();
      
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
          try {
            await sendEmailVerification(userCredential.user);
            setVerificationSent(true);
            setError('Please verify your email before logging in. Check your inbox for the verification link.');
          } catch (verificationError: any) {
            if (verificationError.code === 'auth/too-many-requests') {
              setError('Too many verification emails sent. Please wait a while before trying again.');
            } else {
              throw verificationError;
            }
          }
          return;
        }
        onSuccess();
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        try {
          await sendEmailVerification(userCredential.user);
          setVerificationSent(true);
        } catch (verificationError: any) {
          if (verificationError.code === 'auth/too-many-requests') {
            setError('Too many verification emails sent. Please wait a while before trying again.');
            return;
          }
          throw verificationError;
        }
        
        const userSettings: UserSettings = {
          id: userCredential.user.uid,
          email,
          name,
          theme: 'light',
          hourlyRate: 12.70,
          emailVerified: false,
          createdAt: new Date().toISOString()
        };
        
        await setDoc(doc(db, 'userSettings', userCredential.user.uid), userSettings);
        
        // Don't call onSuccess() here - let the user verify their email first
        setError('Please check your email to verify your account before logging in.');
      }
    } catch (error: any) {
      if (error.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait a while before trying again.');
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      const auth = getAuth();
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setVerificationSent(true);
        setError('Verification email has been resent. Please check your inbox.');
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        {onBackToLanding && (
          <button
            onClick={onBackToLanding}
            className="flex items-center text-slate-600 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Main Page
          </button>
        )}
        
        <div className="text-center">
          <div className="flex justify-center">
            {isLogin ? (
              <LogIn className="h-12 w-12 text-sky-400" />
            ) : (
              <UserPlus className="h-12 w-12 text-sky-400" />
            )}
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-slate-700">
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {isLogin ? 'Sign in to your account' : 'Start tracking your time'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                  Name
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                    placeholder="Your name"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-sky-500 focus:ring-sky-500 border-slate-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700">
                  Remember me
                </label>
              </div>
            )}
          </div>

          {error && (
            <div className="text-sm text-rose-600 bg-rose-50 p-3 rounded-md">
              {error}
              {verificationSent && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  className="ml-2 text-sky-600 hover:text-sky-500"
                >
                  Resend verification email
                </button>
              )}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-sky-600 hover:text-sky-500"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};