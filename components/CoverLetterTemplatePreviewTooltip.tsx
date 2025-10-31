import React from 'react';
import { CoverLetterTemplate } from '../types.ts';

interface CoverLetterTemplatePreviewTooltipProps {
  template: CoverLetterTemplate;
}

const CoverLetterTemplatePreviewTooltip: React.FC<CoverLetterTemplatePreviewTooltipProps> = ({ template }) => {
  let content;
  let name;

  if (template === 'modern') {
    name = 'Modern Template';
    content = (
      <>
        <div className="h-4 w-2/3 bg-slate-600 dark:bg-slate-400 rounded-sm mb-1"></div>
        <div className="h-2 w-full bg-slate-400 dark:bg-slate-500 rounded-sm"></div>
        <div className="w-full border-t border-slate-200 dark:border-slate-600 my-4"></div>
      </>
    );
  } else if (template === 'classic') {
    name = 'Classic Template';
    content = (
      <div className="flex flex-col items-center w-full">
        <div className="h-4 w-2/3 bg-slate-600 dark:bg-slate-400 rounded-sm mb-1"></div>
        <div className="h-2 w-full bg-slate-400 dark:bg-slate-500 rounded-sm"></div>
        <div className="w-full border-t border-slate-200 dark:border-slate-600 my-4"></div>
      </div>
    );
  } else if (template === 'formal') {
    name = 'Formal Template';
    content = (
       <div className="flex flex-col items-center w-full">
        <div className="h-4 w-2/3 bg-slate-800 dark:bg-slate-300 rounded-sm mb-1"></div>
        <div className="h-2 w-full bg-slate-500 dark:bg-slate-500 rounded-sm"></div>
        <div className="w-full border-t-2 border-slate-400 dark:border-slate-500 my-4"></div>
       </div>
    );
  } else { // concise
    name = 'Concise Template';
    content = (
      <>
        <div className="h-4 w-3/4 bg-slate-600 dark:bg-slate-400 rounded-sm mb-1"></div>
        <div className="h-2 w-full bg-slate-400 dark:bg-slate-500 rounded-sm"></div>
      </>
    );
  }


  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-2xl ring-1 ring-black/5 dark:ring-white/10 pointer-events-none z-20 animate-fade-in-up">
      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2 text-center">{name}</p>
      <div className={`w-full h-auto aspect-[1/1.414] text-[6px] leading-tight bg-slate-50 dark:bg-slate-900 border rounded-md overflow-hidden flex flex-col p-4`}>
        {content}
        <div className="h-px w-full bg-slate-300 dark:bg-slate-500 mt-auto mb-1"></div>
        <div className="h-px w-5/6 bg-slate-300 dark:bg-slate-500 mb-1"></div>
        <div className="h-px w-full bg-slate-300 dark:bg-slate-500 mb-1"></div>
        <div className="h-px w-1/2 bg-slate-300 dark:bg-slate-500"></div>
      </div>
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-slate-800 transform rotate-45"></div>
    </div>
  );
};

export default CoverLetterTemplatePreviewTooltip;