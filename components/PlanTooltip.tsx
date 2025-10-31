import React from 'react';
import { Plan } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';

interface PlanTooltipProps {
  plan: Plan;
}

const PlanTooltip: React.FC<PlanTooltipProps> = ({ plan }) => {
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-2xl ring-1 ring-black/5 dark:ring-white/10 pointer-events-none z-20 animate-fade-in-up">
      <div className="flex items-center gap-2 mb-2">
          <SparklesIcon className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{plan.name}</p>
      </div>
      <p className="text-xs text-slate-600 dark:text-slate-300">
        {plan.tooltipDescription}
      </p>
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-slate-800 transform rotate-45"></div>
    </div>
  );
};

export default PlanTooltip;