// types.ts
export interface WorkExperience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  years?: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
}

export interface CustomSection {
  id: string;
  title: string;
  content: string;
}

export interface Referee {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
}

export interface UserInfo {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  website: string;
  summary: string;
  photo?: string;
  experience: WorkExperience[];
  education: Education[];
  skills: string;
  customSections: CustomSection[];
  referees: Referee[];
}

export interface Suggestion {
  id:string;
  originalText: string;
  suggestion: string;
  explanation: string;
  startIndex: number;
  endIndex: number;
}

export interface KeywordAnalysis {
  matched: string[];
  missing: string[];
}

export type CoverLetterTone = 'Professional' | 'Enthusiastic' | 'Formal' | 'Concise' | 'Creative' | 'Direct';

export type ResumeTemplate = 'modern' | 'classic' | 'minimalist' | 'creative';
export type CoverLetterTemplate = 'modern' | 'classic' | 'formal' | 'concise';

export interface Plan {
  id?: string; // Optional for new plans
  name: string;
  credits: number;
  price: number;
  currency: string;
  description: string;
  isBestValue?: boolean;
  tooltipDescription: string;
}

export interface User {
  id: string;
  username: string;
  credits: number;
  isAdmin: boolean;
}

export interface AdminUserView {
  id: string;
  username: string;
  credits: number;
  isAdmin: boolean;
  createdAt: string;
}

// New type for one-time use codes
export interface AccessCode {
  code: string;
  credits: number;
  createdAt: string;
}

// New type for tracking user purchase intentions
export interface PendingPayment {
  id: string;
  userId: string;
  username: string;
  planId: string;
  planName: string;
  price: number;
  currency: string;
  createdAt: string;
}

// New type for Analytics settings
export interface AnalyticsSettings {
    measurementId: string;
}

// New type for event logging
export interface AppEvent {
  id: string;
  userId: string;
  type: 'generate_resume' | 'generate_cover-letter' | 'download_resume' | 'download_cover-letter' | 'redeem_code' | 'signup';
  payload?: any;
  timestamp: string;
}

// New type for dashboard stats
export interface DashboardStats {
  totalUsers: number;
  newSignupsLast7Days: number;
  totalCreditsPurchased: number;
  aiFeatureUsage: {
    resume: number;
    coverLetter: number;
  };
  templateUsage: {
    modern: number;
    classic: number;
    minimalist: number;
    creative: number;
  };
}