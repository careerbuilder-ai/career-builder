import React from 'react';
import { ResumeTemplate } from '../types';

interface TemplatePreviewTooltipProps {
  template: ResumeTemplate;
}

const TemplatePreviewTooltip: React.FC<TemplatePreviewTooltipProps> = ({ template }) => {
  let content;
  let name;

  if (template === 'modern') {
    name = 'Modern Template';
    content = (
      <>
        <div className="w-1/3 h-full bg-slate-200 dark:bg-slate-600 rounded p-2 flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-slate-400 dark:bg-slate-500 mb-3 flex-shrink-0"></div>
          <div className="w-full h-0.5 bg-slate-400/80 dark:bg-slate-400/80 mb-1"></div>
          <div className="w-4/5 h-0.5 bg-slate-400/60 dark:bg-slate-400/60 mb-3"></div>
          <div className="w-full h-1 bg-indigo-500/50 dark:bg-indigo-400/50 my-1 rounded-full"></div>
          <div className="w-full h-0.5 bg-slate-400/80 dark:bg-slate-400/80 mb-1"></div>
        </div>
        <div className="w-2/3 h-full flex flex-col">
          <div className="h-3 w-3/4 bg-slate-600 dark:bg-slate-400 rounded-full mb-1"></div>
          <div className="h-1.5 w-full bg-slate-400 dark:bg-slate-500 rounded-full mb-4"></div>
          <div className="h-1.5 w-1/4 bg-indigo-500 dark:bg-indigo-400 rounded-full mb-2"></div>
          <div className="h-0.5 w-full bg-slate-300 dark:bg-slate-500 rounded-full mb-1"></div>
        </div>
      </>
    );
  } else if (template === 'classic') {
    name = 'Classic Template';
    content = (
      <>
        <div className="w-full flex flex-col items-center">
          <div className="h-3.5 w-1/2 bg-slate-600 dark:bg-slate-400 rounded-full"></div>
          <div className="h-1.5 w-3/4 bg-slate-400 dark:bg-slate-500 rounded-full mt-2"></div>
        </div>
        <div className="w-full border-t border-slate-300 dark:border-slate-600 my-4"></div>
        <div className="w-full flex flex-col items-center mb-3">
          <div className="h-1.5 w-1/4 bg-slate-500 dark:bg-slate-500 rounded-full tracking-widest mb-2"></div>
          <div className="h-0.5 w-full bg-slate-300 dark:bg-slate-500 rounded-full mb-1"></div>
        </div>
      </>
    );
  } else if (template === 'minimalist') {
    name = 'Minimalist Template';
    content = (
       <div className="w-full flex flex-col items-center p-2">
          <div className="h-3 w-1/2 bg-slate-500 dark:bg-slate-400 rounded-sm"></div>
          <div className="h-1 w-full bg-slate-300 dark:bg-slate-600 rounded-sm mt-1.5"></div>
          <div className="w-full border-t border-slate-200 dark:border-slate-600 my-4"></div>
          <div className="h-1.5 w-1/3 bg-slate-400 dark:bg-slate-500 rounded-sm mb-2 self-start"></div>
          <div className="h-px w-full bg-slate-300 dark:bg-slate-500 mb-1"></div>
          <div className="h-px w-5/6 bg-slate-300 dark:bg-slate-500 mb-3"></div>
          <div className="h-1.5 w-1/3 bg-slate-400 dark:bg-slate-500 rounded-sm mb-2 self-start"></div>
          <div className="h-px w-full bg-slate-300 dark:bg-slate-500 mb-1"></div>
       </div>
    );
  } else { // creative
    name = 'Creative Template';
    content = (
      <>
        <div className="w-1/3 h-full bg-slate-800 dark:bg-slate-800 rounded-sm p-2 flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-slate-500 dark:bg-slate-600 flex-shrink-0 mb-2"></div>
          <div className="h-1.5 w-full bg-teal-400/80 dark:bg-teal-400/80 rounded-full"></div>
        </div>
        <div className="w-2/3 h-full flex flex-col">
          <div className="h-3 w-3/4 bg-slate-600 dark:bg-slate-400 rounded-sm mb-2"></div>
          <div className="h-1.5 w-1/3 bg-teal-500 dark:bg-teal-400 rounded-full mb-2"></div>
          <div className="h-px w-full bg-slate-300 dark:bg-slate-500 mb-1"></div>
          <div className="h-px w-5/6 bg-slate-300 dark:bg-slate-500"></div>
        </div>
      </>
    );
  }


  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-2xl ring-1 ring-black/5 dark:ring-white/10 pointer-events-none z-20 animate-fade-in-up">
      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2 text-center">{name}</p>
      <div className={`w-full h-auto aspect-[1/1.414] text-[6px] leading-tight bg-slate-50 dark:bg-slate-900 border rounded-md overflow-hidden flex ${template === 'classic' || template === 'minimalist' ? 'flex-col' : 'gap-2'} p-2`}>
        {content}
      </div>
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-slate-800 transform rotate-45"></div>
    </div>
  );
};

export default TemplatePreviewTooltip;