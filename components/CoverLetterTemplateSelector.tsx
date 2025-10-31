import React, { useState } from 'react';
import { CoverLetterTemplate } from '../types';
import CoverLetterTemplatePreviewTooltip from './CoverLetterTemplatePreviewTooltip';

interface CoverLetterTemplateSelectorProps {
  activeTemplate: CoverLetterTemplate;
  onTemplateChange: (template: CoverLetterTemplate) => void;
}

const CoverLetterTemplateSelector: React.FC<CoverLetterTemplateSelectorProps> = ({ activeTemplate, onTemplateChange }) => {
  const [hoveredTemplate, setHoveredTemplate] = useState<CoverLetterTemplate | null>(null);
  const templateOptions: { id: CoverLetterTemplate; name: string }[] = [
    { id: 'modern', name: 'Modern' },
    { id: 'classic', name: 'Classic' },
    { id: 'formal', name: 'Formal' },
    { id: 'concise', name: 'Concise' },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
      <label className="text-sm font-medium text-slate-600 dark:text-slate-300 flex-shrink-0">Cover Letter Template:</label>
      <div className="grid grid-cols-4 gap-2 w-full sm:w-auto lg:w-72">
        {templateOptions.map(({ id, name }) => (
          <div
            key={id}
            className="relative"
            onMouseEnter={() => setHoveredTemplate(id)}
            onMouseLeave={() => setHoveredTemplate(null)}
          >
            {hoveredTemplate === id && <CoverLetterTemplatePreviewTooltip template={id} />}
            <button
              onClick={() => onTemplateChange(id)}
              className={`w-full text-center p-1 border-2 rounded-lg transition-all duration-200 ${
                activeTemplate === id
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/40'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
              aria-pressed={activeTemplate === id}
            >
              {/* Visual Preview Divs */}
              <div className="w-full h-12 bg-white dark:bg-slate-700/50 pointer-events-none rounded border border-slate-200 dark:border-slate-600/50 p-1.5 flex flex-col">
                {id === 'modern' ? (
                  <>
                    <div className="h-2 w-1/2 bg-slate-600 dark:bg-slate-400 rounded-sm mb-1"></div>
                    <div className="h-1 w-3/4 bg-slate-400 dark:bg-slate-500 rounded-sm"></div>
                    <div className="w-full border-t border-slate-200 dark:border-slate-600 my-1.5"></div>
                  </>
                ) : id === 'classic' ? (
                   <>
                      <div className="h-2 w-1/2 bg-slate-600 dark:bg-slate-400 rounded-sm mb-1 self-center"></div>
                      <div className="h-1 w-3/4 bg-slate-400 dark:bg-slate-500 rounded-sm self-center"></div>
                      <div className="w-full border-t border-slate-200 dark:border-slate-600 my-1.5"></div>
                    </>
                ) : id === 'formal' ? (
                  <>
                    <div className="h-2 w-1/2 bg-slate-800 dark:bg-slate-300 rounded-sm mb-1 self-center"></div>
                    <div className="h-1 w-3/4 bg-slate-500 dark:bg-slate-500 rounded-sm self-center"></div>
                    <div className="w-full border-t-2 border-slate-400 dark:border-slate-500 my-1.5"></div>
                  </>
                ) : ( // concise
                  <>
                    <div className="h-2 w-2/3 bg-slate-600 dark:bg-slate-400 rounded-sm mb-0.5"></div>
                    <div className="h-1 w-full bg-slate-400 dark:bg-slate-500 rounded-sm"></div>
                  </>
                )}
                 <div className="h-px w-full bg-slate-300 dark:bg-slate-500 mt-auto mb-0.5"></div>
                 <div className="h-px w-5/6 bg-slate-300 dark:bg-slate-500 mb-0.5"></div>
                 <div className="h-px w-full bg-slate-300 dark:bg-slate-500 mb-0.5"></div>
                 <div className="h-px w-1/2 bg-slate-300 dark:bg-slate-500"></div>
              </div>
              <p className={`mt-1 text-xs font-semibold transition-colors ${
                  activeTemplate === id ? 'text-teal-600 dark:text-teal-300' : 'text-slate-700 dark:text-slate-300'
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

export default CoverLetterTemplateSelector;
