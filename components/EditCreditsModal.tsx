import React, { useState, useEffect } from 'react';
// Fix: Import AdminUserView instead of User
import { AdminUserView } from '../types';
import Loader from './common/Loader';

interface EditCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Fix: Use AdminUserView for the user prop
  user: AdminUserView | null;
  onSave: (userId: string, credits: number) => Promise<boolean>;
}

const EditCreditsModal: React.FC<EditCreditsModalProps> = ({ isOpen, onClose, user, onSave }) => {
  const [credits, setCredits] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      // Fix: Correctly initialize credits from the user prop
      setCredits(user.credits || 0); 
    }
  }, [user]);
  
  if (!isOpen || !user) {
    return null;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const success = await onSave(user.id, credits);
    setIsLoading(false);
    if (success) {
      onClose();
    } else {
      setError('Failed to update credits.');
    }
  };

  const handleClose = () => {
      setCredits(0);
      setError('');
      setIsLoading(false);
      onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div 
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm p-6 animate-fade-in-up" 
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Edit Credits for {user.username}</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-6">Set the total number of credits for this user.</p>
        
        <form onSubmit={handleSave}>
            <label htmlFor="credits" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Credits
            </label>
            <input
                id="credits"
                type="number"
                min="0"
                value={credits}
                onChange={(e) => setCredits(Number(e.target.value))}
                className="block w-full px-3 py-2 bg-white dark:bg-slate-700 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <div className="flex justify-end gap-3 mt-6">
            <button 
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-semibold bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
            >
                Cancel
            </button>
            <button 
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 flex items-center justify-center"
            >
                {isLoading ? <Loader className="w-5 h-5" /> : 'Save Credits'}
            </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default EditCreditsModal;
