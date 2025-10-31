import React from 'react';
import { CoverLetterTemplate } from '../types.ts';
import { UserInfo, Suggestion } from '../types.ts';
import ProofreadTextRenderer from './common/ProofreadTextRenderer.tsx';
import { ProofreadIcon } from './icons/ProofreadIcon.tsx';
import Loader from './common/Loader.tsx';

interface CoverLetterPreviewProps {
  userInfo: UserInfo;
  generatedCoverLetter: string | null;
  template: CoverLetterTemplate;
  suggestions: Suggestion[];
  onAcceptSuggestion: (id: string) => void;
  onRejectSuggestion: (id: string) => void;
}

const CoverLetterPreview: React.FC<CoverLetterPreviewProps> = ({ 
  userInfo, 
  generatedCoverLetter, 
  template,
  suggestions,
  onAcceptSuggestion,
  onRejectSuggestion,
}) => {
  if (!generatedCoverLetter) {
    return (
      <div className="text-center text-slate-500 dark:text-slate-400 py-20 px-4">
        <h2 className="text-xl font-semibold">Your AI-Generated Cover Letter Will Appear Here</h2>
        <p className="mt-2">Fill in your details, add a job description, and click "Generate Cover Letter"!</p>
      </div>
    );
  }

  const getFontClass = () => {
    switch (template) {
      case 'classic':
      case 'formal':
        return 'font-serif';
      case 'concise':
      case 'modern':
      default:
        return 'font-sans';
    }
  };
  
  const contactItems = [
    userInfo.email,
    userInfo.phone,
    userInfo.linkedin,
    userInfo.website,
  ].filter(Boolean);

  let header;
  let contentPadding = 'p-4 sm:p-6 md:p-10 lg:p-12';
  let wrapperClass = `bg-white dark:bg-slate-900 shadow-md print:shadow-none print:rounded-none rounded-lg`;
  let bodyClass = `text-sm text-slate-700 dark:text-slate-300 ${getFontClass()}`;

  if (template === 'formal') {
    bodyClass += ' leading-8';
    header = (
      <header className={`pb-8 mb-8 border-b border-slate-300 dark:border-slate-700 text-center ${getFontClass()}`}>
        <h1 className="text-3xl sm:text-4xl tracking-wider font-bold text-slate-900 dark:text-white">{userInfo.name}</h1>
        <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
          {contactItems.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span className="text-slate-400 dark:text-slate-600">&bull;</span>}
              <span>{item}</span>
            </React.Fragment>
          ))}
        </div>
      </header>
    );
  } else if (template === 'concise') {
    bodyClass += ' leading-6';
    contentPadding = 'p-6 sm:p-8';
    header = (
      <header className={`pb-6 mb-6 ${getFontClass()}`}>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{userInfo.name}</h1>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          {contactItems.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span className="text-slate-300 dark:text-slate-600">|</span>}
              <span>{item}</span>
            </React.Fragment>
          ))}
        </div>
      </header>
    );
  } else { // Modern and Classic
    bodyClass += ' leading-7';
    header = (
      <header className={`pb-8 mb-8 border-b border-slate-200 dark:border-slate-700 ${getFontClass()}`}>
        <div className={template === 'modern' ? 'text-left' : 'text-center'}>
          <h1 className={`${template === 'modern' ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl tracking-wider'} font-bold text-slate-900 dark:text-white`}>{userInfo.name}</h1>
          <div className={`mt-3 flex flex-wrap ${template === 'modern' ? 'justify-start' : 'justify-center'} gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400`}>
            {contactItems.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span className="text-slate-300 dark:text-slate-600">&bull;</span>}
                <span>{item}</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </header>
    );
  }

  const renderFormattedContent = () => {
    const paragraphs: { text: string; startIndex: number }[] = [];
    let lastIndex = 0;
    const regex = /\n\s*\n/g;
    let match;

    while ((match = regex.exec(generatedCoverLetter)) !== null) {
      const text = generatedCoverLetter.substring(lastIndex, match.index);
      if (text.trim()) {
        paragraphs.push({ text, startIndex: lastIndex });
      }
      lastIndex = regex.lastIndex;
    }

    const lastText = generatedCoverLetter.substring(lastIndex);
    if (lastText.trim()) {
      paragraphs.push({ text: lastText, startIndex: lastIndex });
    }

    return paragraphs.map((p, index) => {
      const paragraphSuggestions = suggestions
        .filter(s => s.startIndex >= p.startIndex && s.endIndex <= p.startIndex + p.text.length)
        .map(s => ({
          ...s,
          startIndex: s.startIndex - p.startIndex,
          endIndex: s.endIndex - p.startIndex,
        }));

      return (
        <div key={index} className="mb-4 last:mb-0">
          <ProofreadTextRenderer
            text={p.text}
            suggestions={paragraphSuggestions}
            onAccept={onAcceptSuggestion}
            onReject={onRejectSuggestion}
          />
        </div>
      );
    });
  };

  return (
    <div 
        id="cover-letter-preview" 
        className={wrapperClass}
    >
      <div className={contentPadding}>
        {header}
        <div className={bodyClass}>
          {renderFormattedContent()}
        </div>
      </div>
    </div>
  );
};

export default CoverLetterPreview;