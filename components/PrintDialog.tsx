import React from 'react';

interface PrintDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPrintSelect: (document: 'resume' | 'cover-letter') => void;
}

const PrintDialog: React.FC<PrintDialogProps> = ({ isOpen, onClose, onPrintSelect }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm p-6 animate-fade-in-up" 
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Print Document</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-6">Which document would you like to print?</p>
        
        <div className="space-y-3">
          <button 
            onClick={() => onPrintSelect('resume')}
            className="w-full text-center px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
          >
            Print Resume
          </button>
          <button 
            onClick={() => onPrintSelect('cover-letter')}
            className="w-full text-center px-4 py-3 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 transition-colors"
          >
            Print Cover Letter
          </button>
        </div>

        <div className="mt-6 text-center">
            <button 
                onClick={onClose}
                className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100"
            >
                Cancel
            </button>
        </div>
      </div>
    </div>
  );
};

export default PrintDialog;