import React, { useState, useRef, useEffect } from 'react';
import { Suggestion } from '../../types';
import { CheckIcon } from '../icons/CheckIcon';
import { XIcon } from '../icons/XIcon';
import { LightbulbIcon } from '../icons/LightbulbIcon';

interface ProofreadTextRendererProps {
  text: string;
  suggestions: Suggestion[];
  onAccept: (suggestionId: string) => void;
  onReject: (suggestionId: string) => void;
}

const renderTextWithBreaks = (text: string) => {
  if (!text) return null;
  return text.split('\n').map((line, index, arr) => (
    <React.Fragment key={index}>
      {line}
      {index < arr.length - 1 && <br />}
    </React.Fragment>
  ));
};


const ProofreadTextRenderer: React.FC<ProofreadTextRendererProps> = ({ text, suggestions, onAccept, onReject }) => {
  const [activeSuggestionId, setActiveSuggestionId] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleHighlightClick = (suggestionId: string) => {
    setActiveSuggestionId(prevId => (prevId === suggestionId ? null : suggestionId));
  };
  
  // Close popover on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        if (!target.closest('[data-suggestion-id]')) {
             setActiveSuggestionId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!suggestions || suggestions.length === 0) {
    return <>{renderTextWithBreaks(text)}</>;
  }

  // Sort suggestions by start index to process them in order
  const sortedSuggestions = [...suggestions].sort((a, b) => a.startIndex - b.startIndex);

  const parts = [];
  let lastIndex = 0;

  sortedSuggestions.forEach((suggestion) => {
    // Add the text before the current suggestion
    if (suggestion.startIndex > lastIndex) {
      parts.push(renderTextWithBreaks(text.slice(lastIndex, suggestion.startIndex)));
    }
    
    const isActive = activeSuggestionId === suggestion.id;

    // Add the highlighted text for the suggestion
    parts.push(
      <span key={suggestion.id} className="relative inline-block" data-suggestion-id={suggestion.id}>
        <mark
          onClick={() => handleHighlightClick(suggestion.id)}
          className={`px-0.5 rounded cursor-pointer transition-colors ${isActive ? 'bg-indigo-200 dark:bg-indigo-400/40' : 'bg-yellow-200 dark:bg-yellow-400/30 hover:bg-yellow-300 dark:hover:bg-yellow-400/40'}`}
        >
          {renderTextWithBreaks(suggestion.originalText)}
        </mark>
        {isActive && (
          <div
            ref={popoverRef}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-2xl ring-1 ring-black/5 dark:ring-white/10 z-10 animate-fade-in-up"
          >
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-1">Suggested Change:</p>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-700 p-2 rounded">{suggestion.suggestion}</p>
            
            <div className="flex items-start gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                <LightbulbIcon className="w-4 h-4 flex-shrink-0 mt-0.5 text-yellow-500" />
                <span>{suggestion.explanation}</span>
            </div>

            <div className="flex justify-end gap-2 mt-3">
              <button 
                onClick={() => { onReject(suggestion.id); setActiveSuggestionId(null); }}
                className="p-1.5 text-slate-500 dark:text-slate-400 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/40 dark:hover:text-red-400 rounded-full transition-colors" 
                title="Reject Suggestion">
                <XIcon className="w-4 h-4" />
              </button>
              <button 
                onClick={() => { onAccept(suggestion.id); setActiveSuggestionId(null); }}
                className="p-1.5 text-slate-500 dark:text-slate-400 hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900/40 dark:hover:text-green-400 rounded-full transition-colors" 
                title="Accept Suggestion">
                <CheckIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-slate-800 transform rotate-45"></div>
          </div>
        )}
      </span>
    );

    lastIndex = suggestion.endIndex;
  });

  // Add any remaining text after the last suggestion
  if (lastIndex < text.length) {
    parts.push(renderTextWithBreaks(text.slice(lastIndex)));
  }

  return <>{parts}</>;
};

export default ProofreadTextRenderer;