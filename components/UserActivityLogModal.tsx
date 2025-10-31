import React, { useState, useEffect } from 'react';
import { AdminUserView, AppEvent } from '../types';
import * as api from '../services/apiService';
import Loader from './common/Loader';
import { ClockIcon } from './icons/ClockIcon';

interface UserActivityLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUserView | null;
}

const formatEvent = (event: AppEvent): string => {
    let details = '';
    switch (event.type) {
        case 'signup':
            return `User created their account.`;
        case 'generate_resume':
            return `Generated AI Resume Summary.`;
        case 'generate_cover-letter':
            return `Generated AI Cover Letter.`;
        case 'download_resume':
            details = event.payload?.template ? ` (Template: ${event.payload.template})` : '';
            return `Downloaded Resume as PDF${details}.`;
        case 'download_cover-letter':
             details = event.payload?.template ? ` (Template: ${event.payload.template})` : '';
            return `Downloaded Cover Letter as PDF${details}.`;
        case 'redeem_code':
             details = event.payload?.credits ? ` (${event.payload.credits} credits)` : '';
            return `Redeemed an access code${details}.`;
        default:
            return `Unknown event: ${event.type}`;
    }
}

const UserActivityLogModal: React.FC<UserActivityLogModalProps> = ({ isOpen, onClose, user }) => {
  const [log, setLog] = useState<AppEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      const fetchLog = async () => {
        setIsLoading(true);
        setError('');
        try {
          const data = await api.getUserActivityLog(user.id);
          setLog(data);
        } catch (e) {
          setError('Failed to fetch activity log.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchLog();
    }
  }, [isOpen, user]);
  
  if (!isOpen || !user) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl p-6 animate-fade-in-up flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <ClockIcon className="w-6 h-6"/>
            Activity Log for {user.username}
        </h2>
        
        <div className="flex-grow min-h-0 max-h-[70vh] overflow-y-auto pr-4 -mr-4 border-t border-slate-200 dark:border-slate-700 pt-4">
            {isLoading ? (
                <div className="flex justify-center items-center h-48"><Loader/></div>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : log.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400">No activity recorded for this user yet.</p>
            ) : (
                <ul className="space-y-4">
                    {log.map(event => (
                        <li key={event.id} className="flex items-start gap-3">
                            <div className="w-2.5 h-2.5 bg-slate-300 dark:bg-slate-600 rounded-full mt-1.5 flex-shrink-0"></div>
                            <div>
                                <p className="text-sm text-slate-700 dark:text-slate-300">{formatEvent(event)}</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500">{new Date(event.timestamp).toLocaleString()}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
        
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button 
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
            >
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default UserActivityLogModal;