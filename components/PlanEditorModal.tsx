import React, { useState, useEffect } from 'react';
import { Plan } from '../types';
import Loader from './common/Loader';
import TextInput from './common/TextInput';
import TextArea from './common/TextArea';

interface PlanEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: Plan) => Promise<boolean>;
  plan: Plan | null;
}

const emptyPlan: Plan = {
    name: '',
    credits: 10,
    price: 20,
    currency: 'PGK',
    description: '',
    tooltipDescription: '',
    isBestValue: false,
};

const PlanEditorModal: React.FC<PlanEditorModalProps> = ({ isOpen, onClose, onSave, plan }) => {
  const [formData, setFormData] = useState<Plan>(emptyPlan);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
        setFormData(plan ? { ...plan } : emptyPlan);
        setError('');
    }
  }, [isOpen, plan]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim() || !formData.tooltipDescription.trim()) {
        setError('All text fields are required.');
        return;
    }
    setError('');
    setIsLoading(true);
    const success = await onSave(formData);
    setIsLoading(false);
    if (success) {
      onClose();
    } else {
      setError('Failed to save the plan. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg p-6 animate-fade-in-up" 
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">
          {plan ? 'Edit Plan' : 'Add New Plan'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <TextInput label="Plan Name" name="name" value={formData.name} onChange={handleChange} required />
            <div className="grid grid-cols-2 gap-4">
                <TextInput label="Credits" name="credits" type="number" min="0" value={formData.credits} onChange={handleChange} required />
                <TextInput label="Price (PGK)" name="price" type="number" min="0" step="0.01" value={formData.price} onChange={handleChange} required />
            </div>
            <TextArea label="Short Description" name="description" value={formData.description} onChange={handleChange} rows={2} required />
            <TextArea label="Tooltip Description" name="tooltipDescription" value={formData.tooltipDescription} onChange={handleChange} rows={3} required />
            
            <div className="flex items-center">
                <input
                    id="isBestValue"
                    name="isBestValue"
                    type="checkbox"
                    checked={formData.isBestValue || false}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="isBestValue" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                    Mark as "Best Value"
                </label>
            </div>

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button 
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-semibold bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
                >
                    Cancel
                </button>
                <button 
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 flex items-center justify-center min-w-[100px]"
                >
                    {isLoading ? <Loader className="w-5 h-5" /> : 'Save Plan'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default PlanEditorModal;
