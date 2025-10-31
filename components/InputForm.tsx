import React, { useState, useRef, useEffect } from 'react';
import { UserInfo, WorkExperience, Education, CustomSection, Referee, KeywordAnalysis, CoverLetterTone } from '../types.ts';
import TextInput from './common/TextInput.tsx';
import TextArea from './common/TextArea.tsx';
import { SparklesIcon } from './icons/SparklesIcon.tsx';
import { TrashIcon } from './icons/TrashIcon.tsx';
import { CameraIcon } from './icons/CameraIcon.tsx';
import ImageCropper from './ImageCropper.tsx';
import { ErrorIcon } from './icons/ErrorIcon.tsx';
import RichTextInput from './common/RichTextInput.tsx';
import { improveWorkDescription, suggestSkills } from '../services/geminiService.ts';
import Loader from './common/Loader.tsx';
import { UserIcon } from './icons/UserIcon.tsx';
import { ChevronDownIcon } from './icons/ChevronDownIcon.tsx';
import { LightbulbIcon } from './icons/LightbulbIcon.tsx';
import { UndoIcon } from './icons/UndoIcon.tsx';
import { RedoIcon } from './icons/RedoIcon.tsx';


// --- Start of in-component definitions to avoid creating new files ---

const BriefcaseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.07a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18.22V14.15M16.5 18.75h-9M18.75 10.5h.15v.15h-.15v-.15zM12 10.5h.15v.15h-.15v-.15zM5.25 10.5h.15v.15h-.15v-.15zM12 3.75a2.25 2.25 0 012.25 2.25v2.25a2.25 2.25 0 01-4.5 0V6a2.25 2.25 0 012.25-2.25zM3.75 6A2.25 2.25 0 016 3.75h12A2.25 2.25 0 0120.25 6v4.5A2.25 2.25 0 0118 12.75H6A2.25 2.25 0 013.75 10.5v-4.5z" />
  </svg>
);

const AcademicCapIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path d="M12 14.25a.75.75 0 01.75.75v5.25a.75.75 0 01-1.5 0v-5.25a.75.75 0 01.75-.75z" />
    <path fillRule="evenodd" d="M3.75 6.75A.75.75 0 014.5 6h15a.75.75 0 01.75.75v3.75a.75.75 0 01-.75.75h-15a.75.75 0 01-.75-.75V6.75zM4.5 15a.75.75 0 01.75-.75h13.5a.75.75 0 01.75.75v3a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75v-3z" clipRule="evenodd" />
  </svg>
);

const DocumentTextIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);


const UserGroupIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962a3.75 3.75 0 015.962 0L14.25 18h4.996a1.875 1.875 0 011.875 1.875v.188a2.625 2.625 0 01-5.25 0V18h-4.996a1.875 1.875 0 01-1.875-1.875v-.188a2.625 2.625 0 015.25 0zM12.75 9a3.75 3.75 0 10-7.5 0 3.75 3.75 0 007.5 0zM5.25 9a3.75 3.75 0 107.5 0 3.75 3.75 0 00-7.5 0z" />
  </svg>
);

const GripVerticalIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M7 3a1 1 0 000 2h.01a1 1 0 000-2H7zM7 8a1 1 0 000 2h.01a1 1 0 000-2H7zM7 13a1 1 0 000 2h.01a1 1 0 000-2H7zM12.01 3a1 1 0 000 2H12a1 1 0 000-2h.01zM12.01 8a1 1 0 000 2H12a1 1 0 000-2h.01zM12.01 13a1 1 0 000 2H12a1 1 0 000-2h.01z" />
  </svg>
);


interface SuggestionModalProps {
  isOpen: boolean;
  suggestions: string[];
  onClose: () => void;
  onSelect: (suggestion: string) => void;
  title: string;
}

const SuggestionModal: React.FC<SuggestionModalProps> = ({ isOpen, suggestions, onClose, onSelect, title }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg p-6 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">{title}</h2>
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                    {suggestions.map((s, i) => (
                        <div key={i} className="p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg">
                            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{s}</p>
                            <div className="text-right mt-2">
                                <button
                                    onClick={() => onSelect(s)}
                                    className="px-3 py-1 text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-500/30 transition-colors"
                                >
                                    Use This Suggestion
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-6 text-right">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- End of in-component definitions ---


interface InputFormProps {
  userInfo: UserInfo;
  onUserInfoChange: (newUserInfo: UserInfo) => void;
  onGenerateResume: () => void;
  onGenerateCoverLetter: () => void;
  isLoading: boolean;
  error: string | null;
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
  targetJobTitle: string;
  onTargetJobTitleChange: (value: string) => void;
  onClearForm: () => void;
  onLoadSampleData: () => void;
  onAnalyzeJobDescription: () => void;
  isKeywordsLoading: boolean;
  keywordAnalysis: KeywordAnalysis;
  coverLetterTone: CoverLetterTone;
  onCoverLetterToneChange: (tone: CoverLetterTone) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isReadOnly: boolean;
}

type DraggableSection = 'experience' | 'education' | 'customSections' | 'referees';
type AccordionSectionName = 'personal' | 'experience' | 'education' | 'referees' | 'custom' | 'skills' | 'generation';

const AccordionSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ title, icon, isOpen, onToggle, children }) => {
  return (
    <div className="border-b border-slate-200 dark:border-slate-700 last:border-b-0">
      <button
        onClick={onToggle}
        className={`w-full flex justify-between items-center py-4 px-2 -mx-2 text-left transition-colors duration-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800 ${isOpen ? 'bg-slate-50 dark:bg-slate-700/50' : ''}`}
        aria-expanded={isOpen}
      >
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
          {icon}
          {title}
        </h3>
        <ChevronDownIcon className={`w-5 h-5 text-slate-500 dark:text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
            <div className="pt-2 pb-6">
                {children}
            </div>
        </div>
      </div>
    </div>
  );
};


const InputForm: React.FC<InputFormProps> = ({ 
  userInfo, 
  onUserInfoChange, 
  onGenerateResume, 
  onGenerateCoverLetter, 
  isLoading, 
  error,
  jobDescription,
  onJobDescriptionChange,
  targetJobTitle,
  onTargetJobTitleChange,
  onClearForm,
  onLoadSampleData,
  onAnalyzeJobDescription,
  isKeywordsLoading,
  keywordAnalysis,
  coverLetterTone,
  onCoverLetterToneChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  isReadOnly,
}) => {
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);
  const [isImprovingIndex, setIsImprovingIndex] = useState<number | null>(null);
  const [suggestionModalState, setSuggestionModalState] = useState<{isOpen: boolean; suggestions: string[]; targetIndex: number | null}>({isOpen: false, suggestions: [], targetIndex: null});
  const [formError, setFormError] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<AccordionSectionName | null>('personal');
  const [isSuggestingSkills, setIsSuggestingSkills] = useState(false);
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);

  // Animation State
  const [justAddedItemId, setJustAddedItemId] = useState<string | null>(null);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);

  // Drag and Drop State
  const [draggedItem, setDraggedItem] = useState<{ id: string; type: DraggableSection } | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: string; type: DraggableSection } | null>(null);
  const [draggedItemHeight, setDraggedItemHeight] = useState<number>(0);

  // Clear justAddedItemId after animation
  useEffect(() => {
    if (justAddedItemId) {
      const timer = setTimeout(() => setJustAddedItemId(null), 300);
      return () => clearTimeout(timer);
    }
  }, [justAddedItemId]);


  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string, type: DraggableSection) => {
    if (isReadOnly) return;
    setDraggedItem({ id, type });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    setDraggedItemHeight(e.currentTarget.offsetHeight);
  };
  
  const handleDragEnter = (id: string, type: DraggableSection) => {
      if (draggedItem && draggedItem.type === type && draggedItem.id !== id) {
          setDropTarget({ id, type });
      }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
  };
  
  const handleDragEnd = () => {
    setDraggedItem(null);
    setDropTarget(null);
    setDraggedItemHeight(0);
  };
  
  const handleDrop = (targetId: string, type: DraggableSection) => {
    if (!draggedItem || draggedItem.type !== type || draggedItem.id === targetId) {
        handleDragEnd();
        return;
    }

    const list = [...userInfo[type]];
    const draggedIndex = list.findIndex(item => item.id === draggedItem.id);

    if (draggedIndex === -1) {
        handleDragEnd();
        return;
    }

    const [removed] = list.splice(draggedIndex, 1);

    if (targetId === '__dropzone_end__') {
        list.push(removed);
    } else {
        const targetIndex = list.findIndex(item => item.id === targetId);
        if (targetIndex !== -1) {
            list.splice(targetIndex, 0, removed);
        } else {
            list.splice(draggedIndex, 0, removed);
        }
    }

    onUserInfoChange({ ...userInfo, [type]: list });
    handleDragEnd();
};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onUserInfoChange({ ...userInfo, [name]: value });
  };

  const handleListChange = <T extends { id: string }>(
    listName: keyof UserInfo,
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const list = userInfo[listName] as T[];
    const newList = [...list];
    newList[index] = { ...newList[index], [name]: value };
    onUserInfoChange({ ...userInfo, [listName]: newList });
  };

  const handleAddItem = (type: DraggableSection) => {
    const newItemId = Date.now().toString();
    let newItem: any;

    switch (type) {
        case 'experience':
            newItem = { id: newItemId, company: '', role: '', startDate: '', endDate: '', description: '', years: '' };
            break;
        case 'education':
            newItem = { id: newItemId, school: '', degree: '', startDate: '', endDate: '' };
            break;
        case 'customSections':
            newItem = { id: newItemId, title: '', content: '' };
            break;
        case 'referees':
            newItem = { id: newItemId, name: '', title: '', company: '', email: '', phone: '' };
            break;
        default:
            return;
    }

    onUserInfoChange({ ...userInfo, [type]: [...(userInfo[type] as any[]), newItem] });
    setJustAddedItemId(newItemId);
  };
  
  const handleRemoveItem = (id: string, type: DraggableSection) => {
    setRemovingItemId(id);
    
    setTimeout(() => {
        const list = [...(userInfo[type] as any[])];
        const updatedList = list.filter(item => item.id !== id);
        onUserInfoChange({ ...userInfo, [type]: updatedList });
        setRemovingItemId(null);
    }, 300); // Match CSS animation duration
  };

  const handleExperienceChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    handleListChange('experience', index, e);
  };

  const handleEducationChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    handleListChange('education', index, e);
  };

  const handleRefereeChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    handleListChange('referees', index, e);
  };
  
  const handleCustomSectionChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    handleListChange('customSections', index, e);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageToCrop(reader.result as string);
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (croppedImageUrl: string) => {
    onUserInfoChange({ ...userInfo, photo: croppedImageUrl });
    setImageToCrop(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = () => {
    onUserInfoChange({ ...userInfo, photo: undefined });
  };

  const handleImproveDescription = async (index: number) => {
    const experience = userInfo.experience[index];
    if (!experience.description.trim()) return;

    setIsImprovingIndex(index);
    setFormError(null);
    try {
        const suggestions = await improveWorkDescription(experience.description, experience.role, experience.company);
        if (suggestions.length > 0) {
            setSuggestionModalState({ isOpen: true, suggestions, targetIndex: index });
        } else {
            setFormError("AI couldn't find a way to improve this description further.");
        }
    } catch (e: any) {
        setFormError(e.message || "Could not improve description.");
    } finally {
        setIsImprovingIndex(null);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    if (suggestionModalState.targetIndex !== null) {
        const index = suggestionModalState.targetIndex;
        const newExperience = [...userInfo.experience];
        newExperience[index].description = suggestion;
        onUserInfoChange({ ...userInfo, experience: newExperience });
    }
    setSuggestionModalState({ isOpen: false, suggestions: [], targetIndex: null });
  };
  
  const handleKeywordCopy = (keyword: string) => {
    navigator.clipboard.writeText(keyword).then(() => {
        setCopiedKeyword(keyword);
        setTimeout(() => setCopiedKeyword(null), 2000);
    });
  };

  const handleToggleSection = (section: AccordionSectionName) => {
    setOpenSection(prevOpenSection => (prevOpenSection === section ? null : section));
  };
  
  const handleSuggestSkills = async () => {
    setIsSuggestingSkills(true);
    setSkillSuggestions([]);
    setFormError(null);
    try {
      const suggestions = await suggestSkills(userInfo, jobDescription);
      const existingSkills = userInfo.skills.split(',').map(s => s.trim().toLowerCase());
      const newSuggestions = suggestions.filter(s => !existingSkills.includes(s.toLowerCase()));
      setSkillSuggestions(newSuggestions);
    } catch (e: any) {
      setFormError(e.message || "Could not suggest skills.");
    } finally {
      setIsSuggestingSkills(false);
    }
  };

  const addSkill = (skill: string) => {
    const currentSkills = userInfo.skills.trim();
    const newSkills = currentSkills ? `${currentSkills}, ${skill}` : skill;
    onUserInfoChange({ ...userInfo, skills: newSkills });
    setSkillSuggestions(prev => prev.filter(s => s !== skill));
  };

  const DropPlaceholder: React.FC = () => (
    <div
      className="my-4 border-2 border-dashed border-indigo-300 dark:border-indigo-700 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/40 flex items-center justify-center transition-all p-4"
      style={{ height: draggedItemHeight > 0 ? `${draggedItemHeight}px` : '4rem' }}
    >
      <span className="text-sm font-semibold text-indigo-500 dark:text-indigo-400">Move Here</span>
    </div>
  );

  return (
    <div className={`p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg ${isReadOnly ? 'pointer-events-none opacity-70' : ''}`}>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Your Information</h2>
        <div className="flex items-center gap-2">
            <button
              onClick={onUndo}
              disabled={!canUndo || isReadOnly}
              className="p-2 text-slate-600 dark:text-slate-300 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700"
              title="Undo (Ctrl+Z)"
            >
              <UndoIcon className="w-5 h-5" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo || isReadOnly}
              className="p-2 text-slate-600 dark:text-slate-300 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700"
              title="Redo (Ctrl+Y)"
            >
              <RedoIcon className="w-5 h-5" />
            </button>
            <div className="h-5 w-px bg-slate-200 dark:bg-slate-600"></div>
            <button
              onClick={onLoadSampleData}
              disabled={isReadOnly}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-indigo-100 hover:text-indigo-700 dark:hover:bg-indigo-900/50 dark:hover:text-indigo-300 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Load sample data"
            >
              <UserIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Load Sample</span>
            </button>
            <button
              onClick={onClearForm}
              disabled={isReadOnly}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/50 dark:hover:text-red-300 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Clear all form data"
            >
              <TrashIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Clear Form</span>
            </button>
        </div>
      </div>
      
      <AccordionSection title="Personal Details" icon={<UserIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />} isOpen={openSection === 'personal'} onToggle={() => handleToggleSection('personal')}>
        {/* Photo */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Profile Photo (Optional)</label>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
              {userInfo.photo ? (
                <img src={userInfo.photo} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <CameraIcon className="w-10 h-10 text-slate-400 dark:text-slate-500" />
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <input type="file" accept="image/*" onChange={handlePhotoChange} ref={fileInputRef} className="hidden" id="photo-upload" disabled={isReadOnly} />
              <button onClick={() => fileInputRef.current?.click()} disabled={isReadOnly} className="w-full sm:w-auto px-4 py-2 text-sm font-semibold bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Upload Photo
              </button>
              {userInfo.photo && (
                <button onClick={removePhoto} disabled={isReadOnly} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/50 dark:hover:text-red-300 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Remove Photo">
                  <TrashIcon className="w-4 h-4"/>
                  <span className="sm:hidden">Remove</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {imageToCrop && (
          <ImageCropper
            isOpen={!!imageToCrop}
            imageSrc={imageToCrop}
            onClose={() => setImageToCrop(null)}
            onCropComplete={onCropComplete}
          />
        )}

        {/* Personal Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <TextInput label="Full Name" name="name" value={userInfo.name} onChange={handleChange} placeholder="e.g., Jane Doe" disabled={isReadOnly}/>
          <TextInput label="Email" name="email" type="email" value={userInfo.email} onChange={handleChange} placeholder="e.g., jane.doe@email.com" disabled={isReadOnly}/>
          <TextInput label="Phone Number" name="phone" value={userInfo.phone} onChange={handleChange} placeholder="e.g., (123) 456-7890" disabled={isReadOnly}/>
          <TextInput label="LinkedIn Profile URL" name="linkedin" value={userInfo.linkedin} onChange={handleChange} placeholder="e.g., linkedin.com/in/janedoe" disabled={isReadOnly}/>
          <TextInput label="Personal Website/Portfolio" name="website" value={userInfo.website} onChange={handleChange} placeholder="e.g., janedoe.com" disabled={isReadOnly}/>
        </div>

        {/* Professional Summary */}
        <TextArea label="Professional Summary" name="summary" value={userInfo.summary} onChange={handleChange} rows={4} placeholder="Write a brief overview of your career, skills, and goals. You can also generate this with AI later." disabled={isReadOnly}/>
      </AccordionSection>

      {/* Work Experience */}
      <AccordionSection title="Work Experience" icon={<BriefcaseIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />} isOpen={openSection === 'experience'} onToggle={() => handleToggleSection('experience')}>
        {userInfo.experience.map((exp, index) => {
          const isDragged = draggedItem?.id === exp.id;
          const isDropTarget = dropTarget?.id === exp.id && dropTarget.type === 'experience';
          const isRemoving = removingItemId === exp.id;
          const isJustAdded = justAddedItemId === exp.id;
          const animationClass = isRemoving ? 'animate-fade-out-shrink' : (isJustAdded ? 'animate-fade-in-up' : '');
          
          return (
            <React.Fragment key={exp.id}>
              {isDropTarget && !isDragged && <DropPlaceholder />}
              <div 
                draggable={!isRemoving && !isReadOnly}
                onDragStart={(e) => handleDragStart(e, exp.id, 'experience')}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDragEnter={() => handleDragEnter(exp.id, 'experience')}
                onDrop={() => handleDrop(exp.id, 'experience')}
                className={`p-4 mb-4 border rounded-lg relative group transition-opacity duration-200 ${animationClass}
                  ${isDragged 
                    ? 'opacity-30 bg-slate-100 dark:bg-slate-900/50' 
                    : 'bg-white dark:bg-slate-800/50 shadow-sm hover:shadow-md dark:shadow-none border-slate-200 dark:border-slate-700 dark:hover:bg-slate-700/50'
                  }`}
              >
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVerticalIcon className="w-5 h-5 text-slate-400 dark:text-slate-500 cursor-grab" title="Drag to reorder"/>
                    <button onClick={() => handleRemoveItem(exp.id, 'experience')} disabled={isReadOnly} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 hover:bg-red-100 dark:hover:text-red-400 dark:hover:bg-red-900/30 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Remove Experience">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div className="md:col-span-3">
                    <TextInput label="Company" name="company" value={exp.company} onChange={(e) => handleExperienceChange(index, e)} disabled={isReadOnly}/>
                  </div>
                  <div className="md:col-span-3">
                    <TextInput label="Role / Title" name="role" value={exp.role} onChange={(e) => handleExperienceChange(index, e)} disabled={isReadOnly}/>
                  </div>
                  <div className="md:col-span-2">
                    <TextInput label="Start Date" name="startDate" value={exp.startDate} onChange={(e) => handleExperienceChange(index, e)} placeholder="e.g., Jan 2020" disabled={isReadOnly}/>
                  </div>
                  <div className="md:col-span-2">
                    <TextInput label="End Date" name="endDate" value={exp.endDate} onChange={(e) => handleExperienceChange(index, e)} placeholder="e.g., Present" disabled={isReadOnly}/>
                  </div>
                  <div className="md:col-span-2">
                    <TextInput label="Years of Experience" name="years" type="number" value={exp.years || ''} onChange={(e) => handleExperienceChange(index, e)} placeholder="e.g., 3" min="0" disabled={isReadOnly}/>
                  </div>
                </div>
                <div className="mt-4 relative">
                    <TextArea label="Description & Achievements" name="description" value={exp.description} onChange={(e) => handleExperienceChange(index, e)} rows={4} placeholder="Describe your responsibilities and key achievements." disabled={isReadOnly}/>
                    <button
                        onClick={() => handleImproveDescription(index)}
                        disabled={isImprovingIndex !== null || isReadOnly}
                        className="absolute top-0 right-0 mt-1 mr-1 p-1.5 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Improve with AI"
                    >
                        {isImprovingIndex === index ? <Loader className="w-5 h-5" /> : <SparklesIcon className="w-5 h-5" />}
                    </button>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div onDragOver={handleDragOver} onDragEnter={() => handleDragEnter('__dropzone_end__', 'experience')} onDrop={() => handleDrop('__dropzone_end__', 'experience')}>
            {dropTarget?.id === '__dropzone_end__' && dropTarget?.type === 'experience' ? <DropPlaceholder/> : <div className="h-1"></div>}
        </div>
        <button onClick={() => handleAddItem('experience')} disabled={isReadOnly} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed">+ Add Experience</button>
      </AccordionSection>

      {/* Education */}
      <AccordionSection title="Education" icon={<AcademicCapIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />} isOpen={openSection === 'education'} onToggle={() => handleToggleSection('education')}>
        {userInfo.education.map((edu, index) => {
            const isDragged = draggedItem?.id === edu.id;
            const isDropTarget = dropTarget?.id === edu.id && dropTarget.type === 'education';
            const isRemoving = removingItemId === edu.id;
            const isJustAdded = justAddedItemId === edu.id;
            const animationClass = isRemoving ? 'animate-fade-out-shrink' : (isJustAdded ? 'animate-fade-in-up' : '');
            return (
                <React.Fragment key={edu.id}>
                    {isDropTarget && !isDragged && <DropPlaceholder />}
                    <div 
                        key={edu.id} 
                        draggable={!isRemoving && !isReadOnly}
                        onDragStart={(e) => handleDragStart(e, edu.id, 'education')}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        onDragEnter={() => handleDragEnter(edu.id, 'education')}
                        onDrop={() => handleDrop(edu.id, 'education')}
                        className={`p-4 mb-4 border rounded-lg relative group transition-opacity duration-200 ${animationClass}
                          ${isDragged 
                            ? 'opacity-30 bg-slate-100 dark:bg-slate-900/50' 
                            : 'bg-white dark:bg-slate-800/50 shadow-sm hover:shadow-md dark:shadow-none border-slate-200 dark:border-slate-700 dark:hover:bg-slate-700/50'
                          }`}
                    >
                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVerticalIcon className="w-5 h-5 text-slate-400 dark:text-slate-500 cursor-grab" title="Drag to reorder"/>
                        <button onClick={() => handleRemoveItem(edu.id, 'education')} disabled={isReadOnly} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 hover:bg-red-100 dark:hover:text-red-400 dark:hover:bg-red-900/30 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Remove Education">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TextInput label="School / University" name="school" value={edu.school} onChange={(e) => handleEducationChange(index, e)} disabled={isReadOnly}/>
                        <TextInput label="Degree / Field of Study" name="degree" value={edu.degree} onChange={(e) => handleEducationChange(index, e)} disabled={isReadOnly}/>
                        <TextInput label="Start Date" name="startDate" value={edu.startDate} onChange={(e) => handleEducationChange(index, e)} placeholder="e.g., Aug 2016" disabled={isReadOnly}/>
                        <TextInput label="End Date" name="endDate" value={edu.endDate} onChange={(e) => handleEducationChange(index, e)} placeholder="e.g., May 2020" disabled={isReadOnly}/>
                        </div>
                    </div>
                </React.Fragment>
            );
        })}
        <div onDragOver={handleDragOver} onDragEnter={() => handleDragEnter('__dropzone_end__', 'education')} onDrop={() => handleDrop('__dropzone_end__', 'education')}>
            {dropTarget?.id === '__dropzone_end__' && dropTarget?.type === 'education' ? <DropPlaceholder/> : <div className="h-1"></div>}
        </div>
        <button onClick={() => handleAddItem('education')} disabled={isReadOnly} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed">+ Add Education</button>
      </AccordionSection>

      {/* Skills */}
      <AccordionSection title="Skills" icon={<SparklesIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />} isOpen={openSection === 'skills'} onToggle={() => handleToggleSection('skills')}>
        <TextArea label="Skills List" name="skills" value={userInfo.skills} onChange={handleChange} rows={4} placeholder="List your skills, separated by commas (e.g., JavaScript, React, Node.js, Project Management)." disabled={isReadOnly}/>
        <div className="mt-4">
          <button onClick={handleSuggestSkills} disabled={isSuggestingSkills || !jobDescription || isReadOnly} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/50 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isSuggestingSkills ? <Loader className="w-4 h-4" /> : <LightbulbIcon className="w-4 h-4" />}
            {isSuggestingSkills ? 'Thinking...' : 'Suggest Skills with AI'}
          </button>
          {skillSuggestions.length > 0 && (
            <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">AI Suggestions (click to add):</h4>
                <div className="flex flex-wrap gap-2">
                    {skillSuggestions.map(skill => (
                        <button key={skill} onClick={() => addSkill(skill)} disabled={isReadOnly} className="px-2.5 py-1 text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900/70 dark:text-teal-200 rounded-full hover:bg-teal-200 dark:hover:bg-teal-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            + {skill}
                        </button>
                    ))}
                </div>
            </div>
          )}
        </div>
      </AccordionSection>
      
      {/* Custom Sections */}
      <AccordionSection title="Custom Sections" icon={<DocumentTextIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />} isOpen={openSection === 'custom'} onToggle={() => handleToggleSection('custom')}>
        {userInfo.customSections.map((section, index) => {
            const isDragged = draggedItem?.id === section.id;
            const isDropTarget = dropTarget?.id === section.id && dropTarget.type === 'customSections';
            const isRemoving = removingItemId === section.id;
            const isJustAdded = justAddedItemId === section.id;
            const animationClass = isRemoving ? 'animate-fade-out-shrink' : (isJustAdded ? 'animate-fade-in-up' : '');
            return (
                <React.Fragment key={section.id}>
                    {isDropTarget && !isDragged && <DropPlaceholder />}
                    <div 
                        key={section.id} 
                        draggable={!isRemoving && !isReadOnly}
                        onDragStart={(e) => handleDragStart(e, section.id, 'customSections')}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        onDragEnter={() => handleDragEnter(section.id, 'customSections')}
                        onDrop={() => handleDrop(section.id, 'customSections')}
                        className={`p-4 mb-4 border rounded-lg relative group transition-opacity duration-200 ${animationClass}
                        ${isDragged 
                            ? 'opacity-30 bg-slate-100 dark:bg-slate-900/50' 
                            : 'bg-white dark:bg-slate-800/50 shadow-sm hover:shadow-md dark:shadow-none border-slate-200 dark:border-slate-700 dark:hover:bg-slate-700/50'
                        }`}
                    >
                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVerticalIcon className="w-5 h-5 text-slate-400 dark:text-slate-500 cursor-grab" title="Drag to reorder"/>
                        <button onClick={() => handleRemoveItem(section.id, 'customSections')} disabled={isReadOnly} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 hover:bg-red-100 dark:hover:text-red-400 dark:hover:bg-red-900/30 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Remove Section">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                        <TextInput label="Section Title" name="title" value={section.title} onChange={(e) => handleCustomSectionChange(index, e)} placeholder="e.g., Projects, Certifications" disabled={isReadOnly}/>
                        <RichTextInput
                            label="Content / Bullet Points"
                            value={section.content}
                            onChange={(value) => {
                            const newList = [...userInfo.customSections];
                            newList[index] = { ...newList[index], content: value };
                            onUserInfoChange({ ...userInfo, customSections: newList as CustomSection[] });
                            }}
                            placeholder="Describe your project, certification, etc."
                            isReadOnly={isReadOnly}
                        />
                        </div>
                    </div>
                </React.Fragment>
            );
        })}
        <div onDragOver={handleDragOver} onDragEnter={() => handleDragEnter('__dropzone_end__', 'customSections')} onDrop={() => handleDrop('__dropzone_end__', 'customSections')}>
            {dropTarget?.id === '__dropzone_end__' && dropTarget?.type === 'customSections' ? <DropPlaceholder/> : <div className="h-1"></div>}
        </div>
        <button onClick={() => handleAddItem('customSections')} disabled={isReadOnly} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed">+ Add Section</button>
      </AccordionSection>

      {/* Referees */}
      <AccordionSection title="Referees" icon={<UserGroupIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />} isOpen={openSection === 'referees'} onToggle={() => handleToggleSection('referees')}>
        {userInfo.referees.map((ref, index) => {
            const isDragged = draggedItem?.id === ref.id;
            const isDropTarget = dropTarget?.id === ref.id && dropTarget.type === 'referees';
            const isRemoving = removingItemId === ref.id;
            const isJustAdded = justAddedItemId === ref.id;
            const animationClass = isRemoving ? 'animate-fade-out-shrink' : (isJustAdded ? 'animate-fade-in-up' : '');
            return (
                <React.Fragment key={ref.id}>
                    {isDropTarget && !isDragged && <DropPlaceholder />}
                    <div 
                        key={ref.id} 
                        draggable={!isRemoving && !isReadOnly}
                        onDragStart={(e) => handleDragStart(e, ref.id, 'referees')}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        onDragEnter={() => handleDragEnter(ref.id, 'referees')}
                        onDrop={() => handleDrop(ref.id, 'referees')}
                        className={`p-4 mb-4 border rounded-lg relative group transition-opacity duration-200 ${animationClass}
                          ${isDragged 
                            ? 'opacity-30 bg-slate-100 dark:bg-slate-900/50' 
                            : 'bg-white dark:bg-slate-800/50 shadow-sm hover:shadow-md dark:shadow-none border-slate-200 dark:border-slate-700 dark:hover:bg-slate-700/50'
                          }`}
                    >
                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVerticalIcon className="w-5 h-5 text-slate-400 dark:text-slate-500 cursor-grab" title="Drag to reorder"/>
                        <button onClick={() => handleRemoveItem(ref.id, 'referees')} disabled={isReadOnly} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 hover:bg-red-100 dark:hover:text-red-400 dark:hover:bg-red-900/30 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Remove Referee">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TextInput label="Referee Name" name="name" value={ref.name} onChange={(e) => handleRefereeChange(index, e)} disabled={isReadOnly}/>
                            <TextInput label="Title" name="title" value={ref.title} onChange={(e) => handleRefereeChange(index, e)} disabled={isReadOnly}/>
                            <TextInput label="Company" name="company" value={ref.company} onChange={(e) => handleRefereeChange(index, e)} disabled={isReadOnly}/>
                            <TextInput label="Email" name="email" type="email" value={ref.email} onChange={(e) => handleRefereeChange(index, e)} disabled={isReadOnly}/>
                            <TextInput label="Phone" name="phone" value={ref.phone} onChange={(e) => handleRefereeChange(index, e)} disabled={isReadOnly}/>
                        </div>
                    </div>
                </React.Fragment>
            );
        })}
        <div onDragOver={handleDragOver} onDragEnter={() => handleDragEnter('__dropzone_end__', 'referees')} onDrop={() => handleDrop('__dropzone_end__', 'referees')}>
            {dropTarget?.id === '__dropzone_end__' && dropTarget?.type === 'referees' ? <DropPlaceholder/> : <div className="h-1"></div>}
        </div>
        <button onClick={() => handleAddItem('referees')} disabled={isReadOnly} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed">+ Add Referee</button>
      </AccordionSection>

      {/* AI Generation Section */}
      <AccordionSection title="AI Generation" icon={<SparklesIcon className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />} isOpen={openSection === 'generation'} onToggle={() => handleToggleSection('generation')}>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Paste a job description below, and we'll use AI to tailor your resume summary and generate a cover letter.</p>
        <TextArea label="Target Job Description" value={jobDescription} onChange={(e) => onJobDescriptionChange(e.target.value)} onBlur={onAnalyzeJobDescription} rows={6} placeholder="Paste the full job description here..." disabled={isReadOnly}/>
        
        <div className="mt-4">
            <TextInput 
                label="Target Job Title (for cover letter)" 
                name="targetJobTitle" 
                value={targetJobTitle} 
                onChange={(e) => onTargetJobTitleChange(e.target.value)} 
                placeholder="e.g., Senior Frontend Engineer" 
                disabled={isReadOnly}
            />
        </div>

        {isKeywordsLoading && (
            <div className="mt-4 flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Loader />
                <span className="text-sm">Analyzing job description...</span>
            </div>
        )}
        {(keywordAnalysis.matched.length > 0 || keywordAnalysis.missing.length > 0) && (
            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Keyword Analysis:</h4>
                <div className="space-y-2">
                    <div>
                        <h5 className="text-xs font-bold text-green-600 dark:text-green-400 mb-1">MATCHED ({keywordAnalysis.matched.length})</h5>
                        <div className="flex flex-wrap gap-2">
                            {keywordAnalysis.matched.map(kw => (
                                <span key={kw} className="px-2.5 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/70 dark:text-green-200 rounded-full">{kw}</span>
                            ))}
                        </div>
                    </div>
                     <div>
                        <h5 className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">MISSING ({keywordAnalysis.missing.length})</h5>
                        <div className="flex flex-wrap gap-2">
                            {keywordAnalysis.missing.map(kw => (
                                <button key={kw} onClick={() => handleKeywordCopy(kw)} disabled={isReadOnly} className="relative px-2.5 py-1 text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/70 dark:text-amber-200 rounded-full hover:bg-amber-200 dark:hover:bg-amber-900 transition-colors" title="Copy keyword">
                                    {kw}
                                    {copiedKeyword === kw && <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs bg-slate-800 text-white px-2 py-0.5 rounded">Copied!</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}
        
        {(error || formError) && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-2">
            <ErrorIcon className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error || formError}</p>
          </div>
        )}

        <div className="mt-6 space-y-4">
           <div>
             <button 
                onClick={onGenerateResume}
                disabled={isLoading || !jobDescription || isReadOnly}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-400 dark:disabled:bg-indigo-500/50 disabled:cursor-not-allowed transition-colors"
             >
                <SparklesIcon className="w-5 h-5" />
                Generate Resume Summary
             </button>
           </div>
           <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                      <label htmlFor="cover-letter-tone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Cover Letter Tone
                      </label>
                      <select
                        id="cover-letter-tone"
                        value={coverLetterTone}
                        onChange={(e) => onCoverLetterToneChange(e.target.value as CoverLetterTone)}
                        className="block w-full px-3 py-2 bg-white dark:bg-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isReadOnly}
                      >
                          <option>Professional</option>
                          <option>Enthusiastic</option>
                          <option>Formal</option>
                          <option>Concise</option>
                          <option>Creative</option>
                          <option>Direct</option>
                      </select>
                  </div>
                  <div className="flex-1 self-end">
                      <button 
                        onClick={onGenerateCoverLetter}
                        disabled={isLoading || !jobDescription || isReadOnly}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 disabled:bg-teal-400 dark:disabled:bg-teal-500/50 disabled:cursor-not-allowed transition-colors"
                      >
                        <SparklesIcon className="w-5 h-5" />
                        Generate Cover Letter
                      </button>
                  </div>
                </div>
           </div>
        </div>
      </AccordionSection>
      <SuggestionModal 
        isOpen={suggestionModalState.isOpen}
        onClose={() => setSuggestionModalState({ isOpen: false, suggestions: [], targetIndex: null})}
        onSelect={handleSelectSuggestion}
        suggestions={suggestionModalState.suggestions}
        title="AI-Powered Suggestions"
      />
    </div>
  );
};

export default InputForm;