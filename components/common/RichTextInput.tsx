import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ListBulletIcon } from '../icons/ListBulletIcon';
import { LinkIcon } from '../icons/LinkIcon';

// --- Start of in-component definitions ---
interface LinkPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (url: string) => void;
}

const LinkPromptModal: React.FC<LinkPromptModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [url, setUrl] = useState('https://');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
        // Focus and select the text after "https://"
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
                inputRef.current.setSelectionRange(8, inputRef.current.value.length);
            }
        }, 100);
    }
  }, [isOpen]);


  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && url.trim() !== 'https://') {
      onConfirm(url);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm p-6 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Enter URL</h2>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="block w-full px-3 py-2 bg-white dark:bg-slate-700 dark:text-slate-100 border border-slate-300 dark:border-slate-500 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Apply
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
// --- End of in-component definitions ---


interface RichTextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isReadOnly?: boolean;
}

const RichTextInput: React.FC<RichTextInputProps> = ({ label, value, onChange, placeholder, isReadOnly = false }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  
  // State for toolbar buttons
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isList, setIsList] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [savedSelection, setSavedSelection] = useState<Range | null>(null);

  const updateToolbarState = useCallback(() => {
    setIsBold(document.queryCommandState('bold'));
    setIsItalic(document.queryCommandState('italic'));
    setIsUnderline(document.queryCommandState('underline'));
    setIsList(document.queryCommandState('insertUnorderedList'));

    let node = document.getSelection()?.anchorNode;
    let isLinkFound = false;
    while(node && node !== editorRef.current) {
        if (node.nodeName === 'A') {
            isLinkFound = true;
            break;
        }
        node = node.parentNode;
    }
    setIsLink(isLinkFound);
  }, []);

  // Update toolbar state on selection change
  useEffect(() => {
    const handleSelectionChange = () => {
      if (editorRef.current && editorRef.current.contains(document.getSelection()?.anchorNode)) {
          updateToolbarState();
      }
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [updateToolbarState]);

  const handleExecCommand = (e: React.MouseEvent<HTMLButtonElement>, command: string) => {
    e.preventDefault();
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, undefined);
      onChange(editorRef.current.innerHTML);
      updateToolbarState();
    }
  };

  const handleLinkButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isLink) { // If it's already a link, unlink it
      document.execCommand('unlink', false, undefined);
      if (editorRef.current) onChange(editorRef.current.innerHTML);
      updateToolbarState();
    } else { // Otherwise, open the prompt to create a link
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        setSavedSelection(selection.getRangeAt(0).cloneRange());
        setIsLinkModalOpen(true);
      }
    }
  };
  
  const handleConfirmLink = (url: string) => {
    setIsLinkModalOpen(false);
    if (editorRef.current && savedSelection) {
      editorRef.current.focus();
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(savedSelection);
      }
      
      let finalUrl = url.trim();
      if (!/^https?:\/\//i.test(finalUrl)) {
          finalUrl = 'https://' + finalUrl;
      }

      document.execCommand('createLink', false, finalUrl);
      onChange(editorRef.current.innerHTML);
      updateToolbarState();
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    onChange(e.currentTarget.innerHTML);
  };
  
  // Strip formatting from pasted content
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };
  
  // Check if editor is empty to show a more reliable placeholder
  const isEmpty = !value || value === '<p><br></p>' || value === '<br>';

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
      <div className={`border border-slate-300 dark:border-slate-600 rounded-md shadow-sm ${!isReadOnly ? 'focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500' : ''}`}>
        {!isReadOnly && (
            <div className="flex items-center gap-1 p-1.5 border-b border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 rounded-t-md">
            <button 
                type="button" 
                onMouseDown={(e) => handleExecCommand(e, 'bold')} 
                className={`w-8 h-8 flex items-center justify-center text-sm font-bold rounded transition-colors ${isBold ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/30 dark:text-indigo-300' : 'hover:bg-slate-200 dark:hover:bg-slate-600'}`} 
                title="Bold">
                B
            </button>
            <button 
                type="button" 
                onMouseDown={(e) => handleExecCommand(e, 'italic')} 
                className={`w-8 h-8 flex items-center justify-center text-sm italic rounded transition-colors ${isItalic ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/30 dark:text-indigo-300' : 'hover:bg-slate-200 dark:hover:bg-slate-600'}`} 
                title="Italic">
                I
            </button>
            <button 
                type="button" 
                onMouseDown={(e) => handleExecCommand(e, 'underline')} 
                className={`w-8 h-8 flex items-center justify-center text-sm underline rounded transition-colors ${isUnderline ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/30 dark:text-indigo-300' : 'hover:bg-slate-200 dark:hover:bg-slate-600'}`} 
                title="Underline">
                U
            </button>
            <button 
                type="button" 
                onMouseDown={(e) => handleExecCommand(e, 'insertUnorderedList')} 
                className={`w-8 h-8 flex items-center justify-center text-sm rounded transition-colors ${isList ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/30 dark:text-indigo-300' : 'hover:bg-slate-200 dark:hover:bg-slate-600'}`} 
                title="Bullet List">
                <ListBulletIcon className="w-5 h-5" />
            </button>
            <button 
                type="button" 
                onMouseDown={handleLinkButtonClick} 
                className={`w-8 h-8 flex items-center justify-center text-sm rounded transition-colors ${isLink ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/30 dark:text-indigo-300' : 'hover:bg-slate-200 dark:hover:bg-slate-600'}`} 
                title={isLink ? "Remove Link" : "Add Link"}>
                <LinkIcon className="w-5 h-5" />
            </button>
            </div>
        )}
        <div 
          className="relative"
          onFocus={() => setIsEditorFocused(true)}
          onBlur={() => setIsEditorFocused(false)}
        >
          {isEmpty && placeholder && !isEditorFocused && (
            <div className="absolute top-2 left-3 text-slate-400 dark:text-slate-500 text-sm pointer-events-none">
              {placeholder}
            </div>
          )}
          <div
            ref={editorRef}
            contentEditable={!isReadOnly}
            onInput={handleInput}
            onKeyUp={updateToolbarState}
            onClick={updateToolbarState}
            onPaste={handlePaste}
            dangerouslySetInnerHTML={{ __html: value }}
            className={`block w-full px-3 py-2 bg-white dark:bg-slate-800 sm:text-sm min-h-[120px] ${!isReadOnly ? 'focus:outline-none' : 'select-text'}`}
            style={{
                // @ts-ignore
                '--link-color': '#4f46e5',
                '--link-hover-color': '#3730a3',
                '--dark-link-color': '#818cf8',
                '--dark-link-hover-color': '#a78bfa',
            }}
          />
          {/* Using style tag for dynamic, scoped styles for the contentEditable div */}
          <style>{`
            div[contentEditable] a { color: var(--link-color); text-decoration: underline; }
            div[contentEditable] a:hover { color: var(--link-hover-color); }
            .dark div[contentEditable] a { color: var(--dark-link-color); }
            .dark div[contentEditable] a:hover { color: var(--dark-link-hover-color); }
          `}</style>
        </div>
      </div>
       <LinkPromptModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        onConfirm={handleConfirmLink}
      />
    </div>
  );
};

export default RichTextInput;