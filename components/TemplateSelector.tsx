import React, { useState } from 'react';
import { ResumeTemplate } from '../types';
import TemplatePreviewTooltip from './TemplatePreviewTooltip';

interface TemplateSelectorProps {
  activeTemplate: ResumeTemplate;
  onTemplateChange: (template: ResumeTemplate) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ activeTemplate, onTemplateChange }) => {
  const [hoveredTemplate, setHoveredTemplate] = useState<ResumeTemplate | null>(null);
  const templateOptions: { id: ResumeTemplate; name: string }[] = [
    { id: 'modern', name: 'Modern' },
    { id: 'classic', name: 'Classic' },
    { id: 'minimalist', name: 'Minimalist' },
    { id: 'creative', name: 'Creative' },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
      <label className="text-sm font-medium text-slate-600 dark:text-slate-300 flex-shrink-0">Resume Template:</label>
      <div className="grid grid-cols-4 gap-2 w-full sm:w-auto lg:w-72">
        {templateOptions.map(({ id, name }) => (
          <div
            key={id}
            className="relative"
            onMouseEnter={() => setHoveredTemplate(id)}
            onMouseLeave={() => setHoveredTemplate(null)}
          >
            {hoveredTemplate === id && <TemplatePreviewTooltip template={id} />}
            <button
              onClick={() => onTemplateChange(id)}
              className={`w-full text-center p-1 border-2 rounded-lg transition-all duration-200 ${
                activeTemplate === id
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/40'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
              aria-pressed={activeTemplate === id}
              aria-label={`Select ${name} template`}
            >
              <div className="w-full h-12 bg-white dark:bg-slate-700/50 pointer-events-none rounded border border-slate-200 dark:border-slate-600/50 p-1.5 flex gap-1.5">
                {id === 'modern' ? (
                  <>
                    <div className="w-1/3 h-full bg-slate-100 dark:bg-slate-600 rounded-sm p-1 flex flex-col items-center">
                      <div className="w-4 h-4 rounded-full bg-slate-400 dark:bg-slate-500 flex-shrink-0 mb-1"></div>
                      <div className="w-full h-0.5 bg-slate-400/80 dark:bg-slate-500/80 rounded-full mb-0.5"></div>
                      <div className="w-4/5 h-0.5 bg-slate-400/60 dark:bg-slate-500/60 rounded-full"></div>
                    </div>
                    <div className="w-2/3 h-full flex flex-col p-0.5">
                      <div className="h-1 w-1/3 bg-indigo-500 dark:bg-indigo-400 rounded-full mb-1"></div>
                      <div className="h-px w-full bg-slate-300 dark:bg-slate-500 mb-0.5"></div>
                      <div className="h-px w-5/6 bg-slate-300 dark:bg-slate-500"></div>
                    </div>
                  </>
                ) : id === 'classic' ? (
                   <div className="w-full h-full flex flex-col items-center p-1">
                      <div className="h-2 w-1/2 bg-slate-600 dark:bg-slate-400 rounded-sm"></div>
                      <div className="h-1 w-3/4 bg-slate-400 dark:bg-slate-500 rounded-sm mt-1"></div>
                      <div className="w-full border-t border-slate-300 dark:border-slate-600 my-1.5"></div>
                      <div className="h-1 w-1/4 bg-slate-500 dark:bg-slate-500 rounded-sm mb-1"></div>
                    </div>
                ) : id === 'minimalist' ? (
                  <div className="w-full h-full flex flex-col items-center p-1.5">
                    <div className="h-1.5 w-1/2 bg-slate-500 dark:bg-slate-400 rounded-sm"></div>
                    <div className="h-0.5 w-full bg-slate-300 dark:bg-slate-600 rounded-sm mt-1"></div>
                    <div className="w-full border-t border-slate-200 dark:border-slate-600 my-2"></div>
                    <div className="h-1 w-1/4 bg-slate-400 dark:bg-slate-500 rounded-sm mb-1 self-start"></div>
                  </div>
                ) : (
                  <div className="w-full h-full flex gap-1.5">
                    <div className="w-1/3 h-full bg-slate-800 dark:bg-slate-800 rounded-sm p-1 flex flex-col items-center">
                        <div className="w-4 h-4 rounded-full bg-slate-500 dark:bg-slate-600 flex-shrink-0 mb-1"></div>
                        <div className="h-1 w-full bg-teal-400/80 dark:bg-teal-400/80 rounded-full"></div>
                    </div>
                    <div className="w-2/3 h-full flex flex-col">
                        <div className="h-2 w-3/4 bg-slate-600 dark:bg-slate-400 rounded-sm mb-1"></div>
                        <div className="h-1 w-1/3 bg-teal-500 dark:bg-teal-400 rounded-full mb-1"></div>
                    </div>
                  </div>
                )}
              </div>
              <p className={`mt-1 text-xs font-semibold truncate transition-colors ${
                  activeTemplate === id ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'
              }`}>
                {name}
              </p>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;
