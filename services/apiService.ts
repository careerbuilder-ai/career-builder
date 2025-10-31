// services/apiService.ts
import { User, AdminUserView, Plan, PendingPayment, AccessCode, AnalyticsSettings, AppEvent, DashboardStats } from '../types.ts';
import { DEFAULT_PLANS } from './monetizationService.ts';

// --- Start of Simulated Database ---
const USERS_DB_KEY = 'ai_resume_users_db';
const PENDING_PAYMENTS_DB_KEY = 'ai_resume_pending_payments_db';
const ACCESS_CODES_DB_KEY = 'ai_resume_access_codes_db';
const ANALYTICS_SETTINGS_DB_KEY = 'ai_resume_analytics_settings';
const EVENT_LOG_DB_KEY = 'ai_resume_event_log';
const PLANS_DB_KEY = 'ai_resume_plans_db';


// Helper functions for localStorage
const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error(`Failed to parse ${key} from localStorage`, e);
  }
  return defaultValue;
};

const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key} to localStorage`, e);
  }
};

const getInitialUsers = (): Record<string, User> => ({
  'user1': { id: 'user1', username: 'user', credits: 0, isAdmin: false },
  'admin1': { id: 'admin1', username: 'admin', credits: 999, isAdmin: true },
});

let users: Record<string, User> = getFromStorage(USERS_DB_KEY, getInitialUsers());
let pendingPayments: Record<string, PendingPayment> = getFromStorage(PENDING_PAYMENTS_DB_KEY, {});
let accessCodes: Record<string, AccessCode> = getFromStorage(ACCESS_CODES_DB_KEY, {});
let analyticsSettings: AnalyticsSettings = getFromStorage(ANALYTICS_SETTINGS_DB_KEY, { measurementId: '' });
let eventLog: AppEvent[] = getFromStorage(EVENT_LOG_DB_KEY, []);
let plans: Plan[] = getFromStorage(PLANS_DB_KEY, DEFAULT_PLANS);
// --- End of Simulated Database ---


type AuthResult = { success: true; user: User } | { success: false; message: string };
type ResetResult = { success: true; message: string } | { success: false; message: string };


const simulateNetworkDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// New function to log events
export const logEvent = async (userId: string, type: AppEvent['type'], payload?: any): Promise<void> => {
    // No delay for logging to not slow down the UI
    const newEvent: AppEvent = {
        id: `evt_${Date.now()}`,
        userId,
        type,
        payload,
        timestamp: new Date().toISOString(),
    };
    eventLog.push(newEvent);
    saveToStorage(EVENT_LOG_DB_KEY, eventLog);
};

export const login = async (username: string, password?: string): Promise<AuthResult> => {
  await simulateNetworkDelay();
  const foundUser = Object.values(users).find(u => u.username.toLowerCase() === username.toLowerCase());
  
  if (foundUser) {
    return { success: true, user: { ...foundUser } };
  }
  
  return { success: false, message: 'Invalid username or password.' };
};

export const signUp = async (username: string, password?: string): Promise<AuthResult> => {
  await simulateNetworkDelay();
  if (Object.values(users).some(u => u.username.toLowerCase() === username.toLowerCase())) {
    return { success: false, message: 'Username is already taken.' };
  }
  
  const newUser: User = {
    id: `user${Date.now()}`,
    username,
    credits: 0, // Users start with 0 credits and must purchase
    isAdmin: false,
  };
  
  users[newUser.id] = newUser;
  saveToStorage(USERS_DB_KEY, users);
  
  await logEvent(newUser.id, 'signup');
  
  return { success: true, user: newUser };
};

export const requestPasswordReset = async (username: string): Promise<ResetResult> => {
    await simulateNetworkDelay();
    // For security, always return a success message to prevent username enumeration.
    // In a real application, you'd check if the user exists and send an email here.
    console.log(`Password reset requested for username: ${username}. In a real app, an email would be sent if the user exists.`);
    return {
        success: true,
        message: "If an account with that username exists, a password reset link has been sent to the associated email address."
    };
};

export const getAllUsers = async (): Promise<AdminUserView[]> => {
    await simulateNetworkDelay();
    return Object.values(users).map(({ id, username, credits, isAdmin }) => ({
        id,
        username,
        credits,
        isAdmin,
        createdAt: new Date(parseInt(id.replace(/user|admin/, ''), 10) || Date.now() - Math.random() * 100000000).toISOString(),
    }));
};

export const getUserById = async (userId: string): Promise<User | null> => {
    await simulateNetworkDelay(100);
    return users[userId] || null;
}


export const updateUserCredits = async (userId: string, newCredits: number): Promise<{ success: boolean }> => {
    await simulateNetworkDelay(800);
    if (users[userId]) {
        users[userId].credits = newCredits;
        saveToStorage(USERS_DB_KEY, users);
        return { success: true };
    }
    return { success: false };
};

// --- Monetization Flow & Plan Management Functions ---

export const getPlans = async (): Promise<Plan[]> => {
    await simulateNetworkDelay(200);
    return [...plans];
};

export const savePlan = async (planToSave: Plan): Promise<{ success: boolean; plan: Plan }> => {
    await simulateNetworkDelay();
    if (planToSave.id) { // Update existing plan
        const index = plans.findIndex(p => p.id === planToSave.id);
        if (index > -1) {
            plans[index] = { ...plans[index], ...planToSave };
        }
    } else { // Create new plan
        const newPlan = { ...planToSave, id: `plan_${Date.now()}` };
        plans.push(newPlan);
    }
    saveToStorage(PLANS_DB_KEY, plans);
    return { success: true, plan: planToSave };
};

export const deletePlan = async (planId: string): Promise<{ success: boolean }> => {
    await simulateNetworkDelay();
    plans = plans.filter(p => p.id !== planId);
    saveToStorage(PLANS_DB_KEY, plans);
    return { success: true };
};


export const logPaymentInitiation = async (userId: string, planId: string): Promise<{ success: boolean }> => {
    await simulateNetworkDelay();
    const user = users[userId];
    const plan = plans.find(p => p.id === planId);

    if (!user || !plan) {
        return { success: false };
    }

    const newPendingPayment: PendingPayment = {
        id: `pp_${Date.now()}`,
        userId: user.id,
        username: user.username,
        planId: plan.id,
        planName: plan.name,
        price: plan.price,
        currency: plan.currency,
        createdAt: new Date().toISOString(),
    };

    pendingPayments[newPendingPayment.id] = newPendingPayment;
    saveToStorage(PENDING_PAYMENTS_DB_KEY, pendingPayments);
    return { success: true };
};

export const getPendingPayments = async (): Promise<PendingPayment[]> => {
    await simulateNetworkDelay();
    // FIX: Correctly implement the sort callback function.
    return Object.values(pendingPayments).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// FIX: Implement missing function 'getAnalyticsSettings'.
export const getAnalyticsSettings = async (): Promise<AnalyticsSettings> => {
    await simulateNetworkDelay(100);
    return { ...analyticsSettings };
};

// FIX: Implement missing function 'saveAnalyticsSettings'.
export const saveAnalyticsSettings = async (measurementId: string): Promise<{ success: boolean }> => {
    await simulateNetworkDelay();
    analyticsSettings.measurementId = measurementId;
    saveToStorage(ANALYTICS_SETTINGS_DB_KEY, analyticsSettings);
    return { success: true };
};

// FIX: Implement missing function 'processPendingPayment'.
export const processPendingPayment = async (paymentId: string): Promise<{ success: true; accessCode: AccessCode } | { success: false; message: string }> => {
    await simulateNetworkDelay();
    const payment = pendingPayments[paymentId];
    if (!payment) {
        return { success: false, message: 'Payment not found.' };
    }
    const user = users[payment.userId];
    const plan = plans.find(p => p.id === payment.planId);
    if (!user || !plan) {
        return { success: false, message: 'User or Plan associated with payment not found.' };
    }

    const codeValue = `CODE-${plan.credits}-${Date.now()}`;
    const newAccessCode: AccessCode = {
        code: codeValue,
        credits: plan.credits,
        createdAt: new Date().toISOString(),
    };
    
    accessCodes[codeValue] = newAccessCode;
    saveToStorage(ACCESS_CODES_DB_KEY, accessCodes);

    delete pendingPayments[paymentId];
    saveToStorage(PENDING_PAYMENTS_DB_KEY, pendingPayments);

    return { success: true, accessCode: newAccessCode };
};

// FIX: Implement missing function 'redeemAccessCode'.
export const redeemAccessCode = async (userId: string, code: string): Promise<{ success: true; newCredits: number } | { success: false; message: string }> => {
    await simulateNetworkDelay();
    const accessCode = accessCodes[code];
    if (!accessCode) {
        return { success: false, message: 'Invalid access code.' };
    }

    const user = users[userId];
    if (!user) {
        return { success: false, message: 'User not found.' };
    }

    user.credits += accessCode.credits;
    saveToStorage(USERS_DB_KEY, users);
    
    await logEvent(userId, 'redeem_code', { credits: accessCode.credits });

    // Invalidate the code after use
    delete accessCodes[code];
    saveToStorage(ACCESS_CODES_DB_KEY, accessCodes);

    return { success: true, newCredits: user.credits };
};

// FIX: Implement missing function 'getUserActivityLog'.
export const getUserActivityLog = async (userId: string): Promise<AppEvent[]> => {
    await simulateNetworkDelay();
    return eventLog
        .filter(event => event.userId === userId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// FIX: Implement missing function 'getDashboardStats'.
export const getDashboardStats = async (): Promise<DashboardStats> => {
    await simulateNetworkDelay();
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newSignupsLast7Days = eventLog.filter(e => 
        e.type === 'signup' && new Date(e.timestamp) >= sevenDaysAgo
    ).length;

    const totalCreditsPurchased = eventLog
        .filter(e => e.type === 'redeem_code' && e.payload?.credits)
        .reduce((sum, e) => sum + e.payload.credits, 0);

    const aiFeatureUsage = {
        resume: eventLog.filter(e => e.type === 'generate_resume').length,
        coverLetter: eventLog.filter(e => e.type === 'generate_cover-letter').length,
    };

    const templateUsage: DashboardStats['templateUsage'] = {
        modern: 0,
        classic: 0,
        minimalist: 0,
        creative: 0,
    };

    eventLog.forEach(e => {
        if (e.type === 'download_resume' && e.payload?.template) {
            const template = e.payload.template as keyof typeof templateUsage;
            if (template in templateUsage) {
                templateUsage[template]++;
            }
        }
    });

    return {
        totalUsers: Object.keys(users).length,
        newSignupsLast7Days,
        totalCreditsPurchased,
        aiFeatureUsage,
        templateUsage,
    };
};
