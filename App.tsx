import React, { useState, useEffect, useCallback, useMemo } from 'react';
import InputForm from './components/InputForm';
import ResumePreview from './components/ResumePreview';
import CoverLetterPreview from './components/CoverLetterPreview';
import { UserInfo, ResumeTemplate, Suggestion, KeywordAnalysis, CoverLetterTone, CoverLetterTemplate, User } from './types';
import * as geminiService from './services/geminiService';
import { sampleUserInfo, sampleJobDescription } from './sampleData';
import TemplateSelector from './components/TemplateSelector';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { DownloadIcon } from './components/icons/DownloadIcon';
import { PrintIcon } from './components/icons/PrintIcon';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { ClipboardIcon } from './components/icons/ClipboardIcon';
import { CheckIcon } from './components/icons/CheckIcon';
import { ProofreadIcon } from './components/icons/ProofreadIcon';
import PrintDialog from './components/PrintDialog';
import ConfirmationDialog from './components/ConfirmationDialog';
import CoverLetterTemplateSelector from './components/CoverLetterTemplateSelector';
import ThemeToggle from './components/ThemeToggle';
import LoginScreen from './components/LoginScreen';
import * as api from './services/apiService';
import * as analytics from './services/analyticsService';
import { CreditIcon } from './components/icons/CreditIcon';
import MonetizationModal from './components/MonetizationModal';
import AdminPanel from './components/AdminPanel';
import { CogIcon } from './components/icons/CogIcon';
import { LogoutIcon } from './components/icons/LogoutIcon';
import { useUndoRedo } from './hooks/useUndoRedo';
import { XCircleIcon } from './components/icons/XCircleIcon';

const initialUserInfo: UserInfo = {
  name: '', email: '', phone: '', linkedin: '', website: '', summary: '',
  experience: [], education: [], skills: '', customSections: [], referees: [],
};

type View = 'resume' | 'cover-letter';
type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const { 
    state: userInfo, 
    set: setUserInfo, 
    undo, 
    redo, 
    canUndo, 
    canRedo,
    reset: resetUserInfo
  } = useUndoRedo<UserInfo>(initialUserInfo);
  const [jobDescription, setJobDescription] = useState('');
  const [targetJobTitle, setTargetJobTitle] = useState('');

  const [generatedSummary, setGeneratedSummary] = useState<string | null>(null);
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState<string | null>(null);
  
  const [resumeTemplate, setResumeTemplate] = useState<ResumeTemplate>('modern');
  const [coverLetterTemplate, setCoverLetterTemplate] = useState<CoverLetterTemplate>('modern');

  const [isLoading, setIsLoading] = useState(false);
  const [isKeywordsLoading, setIsKeywordsLoading] = useState(false);
  const [isProofreading, setIsProofreading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeView, setActiveView] = useState<View>('resume');
  
  const [resumeSuggestions, setResumeSuggestions] = useState<Suggestion[]>([]);
  const [coverLetterSuggestions, setCoverLetterSuggestions] = useState<Suggestion[]>([]);
  
  const [keywordAnalysis, setKeywordAnalysis] = useState<KeywordAnalysis>({ matched: [], missing: [] });
  const [coverLetterTone, setCoverLetterTone] = useState<CoverLetterTone>('Professional');

  const [isCopied, setIsCopied] = useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  
  const [isMonetizationModalOpen, setIsMonetizationModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  // --- Admin Impersonation State ---
  const [impersonatedUser, setImpersonatedUser] = useState<User | null>(null);
  const isImpersonating = !!impersonatedUser;
  const currentUser = impersonatedUser || user;

  // Initialize theme state from localStorage or system preference to prevent FOUC.
  // This function runs only once on initial component load.
  const [theme, setTheme] = useState<Theme>(() => {
    try {
        const savedTheme = localStorage.getItem('theme') as Theme;
        // Check if savedTheme is a valid theme value
        if (savedTheme === 'light' || savedTheme === 'dark') {
            return savedTheme;
        }
        // If no valid theme is saved, check system preference
        if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
    } catch {
        // Fallback if localStorage is unavailable (e.g., private browsing)
    }
    // Default to 'light' theme
    return 'light';
  });

  // --- Initialize Analytics ---
  useEffect(() => {
    const initializeAnalytics = async () => {
        const settings = await api.getAnalyticsSettings();
        if (settings && settings.measurementId) {
            analytics.init(settings.measurementId);
        }
    };
    initializeAnalytics();
  }, []);


  // --- Theme Management ---
  // This effect synchronizes the React state with the DOM (by adding/removing the 'dark' class)
  // and with localStorage whenever the theme state changes.
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('theme', theme);
    } catch {
      // Handle cases where localStorage might be disabled
    }
  }, [theme]);
  
  const handleThemeChange = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // --- Undo/Redo Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isImpersonating) return; // Disable shortcuts when impersonating

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCtrlOrCmd = isMac ? event.metaKey : event.ctrlKey;

      if (isCtrlOrCmd && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        undo();
      } else if (isCtrlOrCmd && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, redo, isImpersonating]);

  // --- Functions ---

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    if(loggedInUser.isAdmin) {
        setIsAdminPanelOpen(true);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setImpersonatedUser(null);
    setIsAdminPanelOpen(false);
  };

  const handleStartImpersonation = async (userId: string) => {
    const userToImpersonate = await api.getUserById(userId);
    if (userToImpersonate) {
        setImpersonatedUser(userToImpersonate);
        setIsAdminPanelOpen(false); // Close admin panel to view the app
    } else {
        setError("Could not find user to impersonate.");
    }
  };

  const handleEndImpersonation = () => {
    setImpersonatedUser(null);
    setIsAdminPanelOpen(true); // Go back to admin panel
  };

  const handleGenerate = async (type: 'resume' | 'cover-letter') => {
    if (!currentUser || currentUser.credits < 1) {
      setError("You don't have enough credits to perform this action.");
      setIsMonetizationModalOpen(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      if (type === 'resume') {
        const summary = await geminiService.generateResumeSummary(userInfo, jobDescription);
        setGeneratedSummary(summary);
        setActiveView('resume');
        setResumeSuggestions([]); // Clear old suggestions
      } else {
        const letter = await geminiService.generateCoverLetter(userInfo, jobDescription, coverLetterTone, targetJobTitle);
        setGeneratedCoverLetter(letter);
        setActiveView('cover-letter');
        setCoverLetterSuggestions([]); // Clear old suggestions
      }
      analytics.trackEvent('generate_content', 'ai_generation', `generate_${type}`);
      api.logEvent(currentUser.id, type === 'resume' ? 'generate_resume' : 'generate_cover-letter');
      // Deduct credit
      setUser(prev => prev ? {...prev, credits: prev.credits - 1} : null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProofread = async () => {
    setIsProofreading(true);
    setError(null);
    try {
      if (activeView === 'resume' && (generatedSummary || userInfo.summary)) {
        const textToProofread = generatedSummary || userInfo.summary;
        const suggestions = await geminiService.proofreadText(textToProofread);
        setResumeSuggestions(suggestions);
      } else if (activeView === 'cover-letter' && generatedCoverLetter) {
        const suggestions = await geminiService.proofreadText(generatedCoverLetter);
        setCoverLetterSuggestions(suggestions);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsProofreading(false);
    }
  };

  const handleAcceptSuggestion = (id: string) => {
    if (activeView === 'resume') {
      const suggestion = resumeSuggestions.find(s => s.id === id);
      if (suggestion) {
        const newText = (generatedSummary || userInfo.summary).replace(suggestion.originalText, suggestion.suggestion);
        setGeneratedSummary(newText);
        setResumeSuggestions(resumeSuggestions.filter(s => s.id !== id));
      }
    } else {
      const suggestion = coverLetterSuggestions.find(s => s.id === id);
      if (suggestion && generatedCoverLetter) {
        const newText = generatedCoverLetter.replace(suggestion.originalText, suggestion.suggestion);
        setGeneratedCoverLetter(newText);
        setCoverLetterSuggestions(coverLetterSuggestions.filter(s => s.id !== id));
      }
    }
  };

  const handleRejectSuggestion = (id: string) => {
    if (activeView === 'resume') {
      setResumeSuggestions(resumeSuggestions.filter(s => s.id !== id));
    } else {
      setCoverLetterSuggestions(coverLetterSuggestions.filter(s => s.id !== id));
    }
  };

  const handleAnalyzeJobDescription = useCallback(async () => {
    if (!jobDescription.trim()) {
      setKeywordAnalysis({ matched: [], missing: [] });
      return;
    }
    setIsKeywordsLoading(true);
    setError(null);
    try {
      const keywords = await geminiService.extractKeywordsFromJobDescription(jobDescription);
      const userSkills = new Set(userInfo.skills.toLowerCase().split(',').map(s => s.trim()));
      const matched = keywords.filter(kw => userSkills.has(kw.toLowerCase()));
      const missing = keywords.filter(kw => !userSkills.has(kw.toLowerCase()));
      setKeywordAnalysis({ matched, missing });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsKeywordsLoading(false);
    }
  }, [jobDescription, userInfo.skills]);

  const handleLoadSampleData = () => {
    resetUserInfo(sampleUserInfo);
    setJobDescription(sampleJobDescription);
  };
  
  const handleClearForm = () => {
    resetUserInfo(initialUserInfo);
    setJobDescription('');
    setTargetJobTitle('');
    setGeneratedSummary(null);
    setGeneratedCoverLetter(null);
    setKeywordAnalysis({ matched: [], missing: [] });
    setResumeSuggestions([]);
    setCoverLetterSuggestions([]);
    setError(null);
    setIsClearConfirmOpen(false);
  };

  const handleDownloadPDF = async (documentType: 'resume' | 'cover-letter') => {
     if (!currentUser || currentUser.credits < 1) {
      setError("You need at least 1 credit to download a document.");
      setIsMonetizationModalOpen(true);
      return;
    }
    setUser(prev => prev ? {...prev, credits: prev.credits - 1} : null);

    analytics.trackEvent('download_pdf', 'document_action', `download_${documentType}`);
    
    // Also log internal app event for dashboard
    if (documentType === 'resume') {
        api.logEvent(currentUser.id, 'download_resume', { template: resumeTemplate });
    } else {
        api.logEvent(currentUser.id, 'download_cover-letter', { template: coverLetterTemplate });
    }


    const elementId = documentType === 'resume' ? 'resume-preview' : 'cover-letter-preview';
    const element = document.getElementById(elementId);
    if (element) {
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4',
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgProps = pdf.getImageProperties(imgData);
        const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;
        }
        
        pdf.save(`${documentType}.pdf`);
    }
  };

  const handlePrint = (documentType: 'resume' | 'cover-letter') => {
    if (!currentUser || currentUser.credits < 1) {
      setError("You need at least 1 credit to print a document.");
      setIsMonetizationModalOpen(true);
      return;
    }
    setUser(prev => prev ? {...prev, credits: prev.credits - 1} : null);

    const contentId = documentType === 'resume' ? 'resume-preview' : 'cover-letter-preview';
    const printContent = document.getElementById(contentId);
    if (!printContent) return;

    const cleanup = () => {
      printContent.classList.remove('printable-area');
    };

    // 'afterprint' event is the ideal way to clean up
    window.addEventListener('afterprint', cleanup, { once: true });

    printContent.classList.add('printable-area');
    window.print();
  };

  const handleCopyToClipboard = (type: 'summary' | 'cover-letter') => {
    const textToCopy = type === 'summary' 
        ? (generatedSummary || userInfo.summary) 
        : generatedCoverLetter;
    
    if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    }
  };
  
  const currentSuggestions = useMemo(() => activeView === 'resume' ? resumeSuggestions : coverLetterSuggestions, [activeView, resumeSuggestions, coverLetterSuggestions]);

  const handleRedemptionSuccess = (newCredits: number) => {
    setUser(prev => prev ? {...prev, credits: newCredits} : null);
    setIsMonetizationModalOpen(false);
  };


  if (!user) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }
  
  if (isAdminPanelOpen && user.isAdmin && !isImpersonating) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <button 
                    onClick={() => setIsAdminPanelOpen(false)}
                    className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                    &larr; Back to App
                </button>
            </header>
            <AdminPanel user={user} onStartImpersonation={handleStartImpersonation} />
          </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {isImpersonating && (
        <div className="sticky top-0 z-50 bg-yellow-400 text-yellow-900 font-bold p-2 text-center flex justify-center items-center gap-4 shadow-lg">
            <span>Viewing as <span className="underline">{impersonatedUser.username}</span>. This is a read-only session.</span>
            <button 
                onClick={handleEndImpersonation} 
                className="bg-yellow-600/80 text-white px-3 py-1 rounded-md text-sm hover:bg-yellow-600 flex items-center gap-1.5"
            >
                <XCircleIcon className="w-5 h-5" />
                Exit View
            </button>
        </div>
      )}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-teal-400 rounded-lg flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold">Career Builder</h1>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                {user.isAdmin && !isImpersonating && (
                  <button onClick={() => setIsAdminPanelOpen(true)} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" title="Admin Panel">
                    <CogIcon className="w-5 h-5" />
                  </button>
                )}
                <button onClick={() => setIsMonetizationModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/50" title={`You have ${currentUser.credits} credits remaining.`}>
                    <CreditIcon className="w-4 h-4 text-amber-500" />
                    <span>{currentUser.credits}</span>
                    <span className="hidden sm:inline">Credits</span>
                </button>
                <ThemeToggle theme={theme} onThemeChange={handleThemeChange} />
                <button onClick={handleLogout} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" title="Logout">
                  <LogoutIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
        </div>
      </header>
      
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="lg:sticky lg:top-24">
            <InputForm 
              userInfo={userInfo} 
              onUserInfoChange={setUserInfo}
              onGenerateResume={() => handleGenerate('resume')} 
              onGenerateCoverLetter={() => handleGenerate('cover-letter')}
              isLoading={isLoading}
              error={error}
              jobDescription={jobDescription}
              onJobDescriptionChange={setJobDescription}
              targetJobTitle={targetJobTitle}
              onTargetJobTitleChange={setTargetJobTitle}
              onClearForm={() => setIsClearConfirmOpen(true)}
              onLoadSampleData={handleLoadSampleData}
              onAnalyzeJobDescription={handleAnalyzeJobDescription}
              isKeywordsLoading={isKeywordsLoading}
              keywordAnalysis={keywordAnalysis}
              coverLetterTone={coverLetterTone}
              onCoverLetterToneChange={setCoverLetterTone}
              onUndo={undo}
              onRedo={redo}
              canUndo={canUndo}
              canRedo={canRedo}
              isReadOnly={isImpersonating}
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="p-1 bg-slate-200 dark:bg-slate-700 rounded-lg flex gap-1">
                <button onClick={() => setActiveView('resume')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${activeView === 'resume' ? 'bg-white dark:bg-slate-800 shadow text-indigo-700 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}>Resume</button>
                <button onClick={() => setActiveView('cover-letter')} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${activeView === 'cover-letter' ? 'bg-white dark:bg-slate-800 shadow text-teal-700 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}>Cover Letter</button>
              </div>

              {activeView === 'resume' ? (
                <TemplateSelector activeTemplate={resumeTemplate} onTemplateChange={setResumeTemplate} />
              ) : (
                <CoverLetterTemplateSelector activeTemplate={coverLetterTemplate} onTemplateChange={setCoverLetterTemplate} />
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 p-2 sm:p-3 rounded-lg shadow-lg">
                <div className="flex items-center justify-between mb-3 px-2">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{activeView === 'resume' ? 'Resume Preview' : 'Cover Letter Preview'}</h3>
                    <div className="flex items-center gap-2">
                        <button onClick={handleProofread} disabled={isProofreading || isImpersonating || !((activeView === 'resume' && (generatedSummary || userInfo.summary)) || (activeView === 'cover-letter' && generatedCoverLetter))} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Proofread with AI">
                           {isProofreading ? 'Checking...' : 'Proofread'}
                           <ProofreadIcon className="w-4 h-4"/>
                        </button>
                        <button onClick={() => handleCopyToClipboard(activeView === 'resume' ? 'summary' : 'cover-letter')} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors" title="Copy Text">
                            {isCopied ? <CheckIcon className="w-5 h-5 text-green-500" /> : <ClipboardIcon className="w-5 h-5" />}
                        </button>
                        <button onClick={() => handleDownloadPDF(activeView)} disabled={isImpersonating} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Download as PDF">
                           <DownloadIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => setIsPrintDialogOpen(true)} disabled={isImpersonating} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Print">
                            <PrintIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {currentSuggestions.length > 0 && (
                    <div className="px-4 py-2 mb-3 bg-yellow-50 dark:bg-yellow-900/40 border border-yellow-200 dark:border-yellow-500/30 rounded-lg text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>{currentSuggestions.length} suggestion{currentSuggestions.length > 1 ? 's' : ''} found.</strong> Click on the highlighted text to review.
                    </div>
                )}
                
                <div className={`${activeView === 'resume' ? 'block' : 'hidden'}`}>
                    <ResumePreview 
                      userInfo={userInfo} 
                      generatedSummary={generatedSummary} 
                      template={resumeTemplate}
                      suggestions={resumeSuggestions}
                      onAcceptSuggestion={handleAcceptSuggestion}
                      onRejectSuggestion={handleRejectSuggestion}
                    />
                </div>
                <div className={`${activeView === 'cover-letter' ? 'block' : 'hidden'}`}>
                    <CoverLetterPreview 
                      userInfo={userInfo} 
                      generatedCoverLetter={generatedCoverLetter} 
                      template={coverLetterTemplate}
                      suggestions={coverLetterSuggestions}
                      onAcceptSuggestion={handleAcceptSuggestion}
                      onRejectSuggestion={handleRejectSuggestion}
                    />
                </div>
            </div>
          </div>
        </div>
      </main>
      <PrintDialog 
        isOpen={isPrintDialogOpen}
        onClose={() => setIsPrintDialogOpen(false)}
        onPrintSelect={handlePrint}
      />
      <ConfirmationDialog
        isOpen={isClearConfirmOpen}
        onClose={() => setIsClearConfirmOpen(false)}
        onConfirm={handleClearForm}
        title="Clear Form Data"
        message="Are you sure you want to clear all information? This action cannot be undone."
      />
      <MonetizationModal 
        isOpen={isMonetizationModalOpen}
        onClose={() => setIsMonetizationModalOpen(false)}
        user={currentUser}
        onPurchaseSuccess={handleRedemptionSuccess}
      />
    </div>
  );
};

export default App;