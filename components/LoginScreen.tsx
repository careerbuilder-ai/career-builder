import React, { useState } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import Loader from './common/Loader';
import * as api from '../services/apiService';
import { User } from '../types';
import { ErrorIcon } from './icons/ErrorIcon';
import { CheckIcon } from './icons/CheckIcon';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

type View = 'login' | 'signup' | 'forgot' | 'reset_sent';

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [view, setView] = useState<View>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (view === 'signup' && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const apiCall = view === 'signup' ? api.signUp : api.login;
      const result = await apiCall(username, password);
      // FIX: Explicitly check for the failure case to help TypeScript with type narrowing.
      if (result.success === false) {
        setError(result.message);
      } else {
        onLoginSuccess(result.user);
      }
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
        const result = await api.requestPasswordReset(username);
        if (result.success) {
            setSuccessMessage(result.message);
            setView('reset_sent');
        } else {
            setError(result.message);
        }
    } catch (e: any) {
        setError(e.message || 'An unknown error occurred.');
    } finally {
        setIsLoading(false);
    }
  };
  
  const setViewMode = (newView: View) => {
    setView(newView);
    setError(null);
    setSuccessMessage(null);
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  };

  const renderHeader = () => {
      let title = "Log in to your workspace";
      if (view === 'signup') title = "Create an account to get started";
      if (view === 'forgot') title = "Reset your password";
      if (view === 'reset_sent') title = "Check your email";
      
      return (
        <>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 text-center">Career Builder</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-center">{title}</p>
        </>
      )
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-teal-400 rounded-2xl flex items-center justify-center mb-4">
              <SparklesIcon className="w-9 h-9 text-white" />
            </div>
            {renderHeader()}
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-2">
            {(view === 'login' || view === 'signup') && (
                <>
                    <div className="flex p-1 bg-slate-100 dark:bg-slate-700 rounded-lg mb-6">
                    <button
                        onClick={() => setViewMode('login')}
                        className={`w-1/2 py-2.5 text-sm font-semibold rounded-md transition-colors ${view === 'login' ? 'bg-white dark:bg-slate-800 shadow text-indigo-700 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}
                    >
                        Log In
                    </button>
                    <button
                        onClick={() => setViewMode('signup')}
                        className={`w-1/2 py-2.5 text-sm font-semibold rounded-md transition-colors ${view === 'signup' ? 'bg-white dark:bg-slate-800 shadow text-indigo-700 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}
                    >
                        Sign Up
                    </button>
                    </div>

                    <form onSubmit={handleAuthSubmit} className="space-y-6 px-6 pb-8">
                        <div>
                            <label 
                                htmlFor="username" 
                                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                            >
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder={view === 'signup' ? "Choose a username" : "Enter 'user' or 'admin'"}
                                className="block w-full px-3 py-2 bg-white dark:bg-slate-700 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-baseline">
                                <label 
                                    htmlFor="password" 
                                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                                >
                                    Password
                                </label>
                                {view === 'login' && (
                                    <button type="button" onClick={() => setViewMode('forgot')} className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                                        Forgot password?
                                    </button>
                                )}
                            </div>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={view === 'signup' ? "Create a password" : "Enter any password"}
                                className="block w-full px-3 py-2 bg-white dark:bg-slate-700 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                        </div>

                        {view === 'signup' && (
                        <div>
                            <label 
                                htmlFor="confirmPassword" 
                                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                            >
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your password"
                                className="block w-full px-3 py-2 bg-white dark:bg-slate-700 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                        </div>
                        )}

                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-2 text-sm">
                                <ErrorIcon className="w-5 h-5 flex-shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}
                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-400 dark:disabled:bg-indigo-500/50 transition-colors"
                            >
                                {isLoading ? <Loader className="w-5 h-5"/> : (view === 'signup' ? 'Create Account' : 'Log In')}
                            </button>
                        </div>
                    </form>
                </>
            )}
            
            {view === 'forgot' && (
                <form onSubmit={handleForgotSubmit} className="space-y-6 px-6 pb-8">
                    <div>
                        <label 
                            htmlFor="username-forgot" 
                            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                        >
                            Username
                        </label>
                        <input
                            id="username-forgot"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            className="block w-full px-3 py-2 bg-white dark:bg-slate-700 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                        />
                    </div>
                     {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-2 text-sm">
                            <ErrorIcon className="w-5 h-5 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-400 dark:disabled:bg-indigo-500/50 transition-colors"
                        >
                            {isLoading ? <Loader className="w-5 h-5"/> : 'Send Recovery Link'}
                        </button>
                    </div>
                     <div className="text-center">
                        <button type="button" onClick={() => setViewMode('login')} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:underline">
                            &larr; Back to Login
                        </button>
                    </div>
                </form>
            )}

            {view === 'reset_sent' && (
                <div className="px-6 pb-8 text-center">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-6">{successMessage}</p>
                    <button onClick={() => setViewMode('login')} className="w-full px-4 py-3 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-100 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">
                        Back to Login
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;