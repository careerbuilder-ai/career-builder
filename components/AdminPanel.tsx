import React, { useState, useEffect } from 'react';
import { AdminUserView, User, PendingPayment, AccessCode, DashboardStats, Plan } from '../types';
import * as api from '../services/apiService';
import Loader from './common/Loader';
import { UsersIcon } from './icons/UsersIcon';
import EditCreditsModal from './EditCreditsModal';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';
import { WrenchScrewdriverIcon } from './icons/WrenchScrewdriverIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { CreditIcon } from './icons/CreditIcon';
import { CurrencyDollarIcon } from './icons/CurrencyDollarIcon';
import PlanEditorModal from './PlanEditorModal';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import ConfirmationDialog from './ConfirmationDialog';
import { EyeIcon } from './icons/EyeIcon';
import { ClockIcon } from './icons/ClockIcon';
import UserActivityLogModal from './UserActivityLogModal';


interface AdminPanelProps {
    user: User;
    onStartImpersonation: (userId: string) => void;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
        </div>
    </div>
);

const BarChart: React.FC<{ title: string; data: { label: string; value: number }[] }> = ({ title, data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1); // Avoid division by zero
    
    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md">
            <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">{title}</h4>
            <div className="space-y-3">
                {data.length > 0 ? data.map(item => (
                    <div key={item.label} className="flex items-center gap-3 text-sm">
                        <span className="w-28 text-slate-600 dark:text-slate-300 truncate font-medium">{item.label}</span>
                        <div className="flex-grow bg-slate-100 dark:bg-slate-700 rounded-full h-6 flex items-center">
                            <div 
                                className="bg-indigo-500 rounded-full h-6 flex items-center justify-end px-2 text-white text-xs font-bold transition-all duration-500"
                                style={{ width: `${(item.value / maxValue) * 100}%` }}
                            >
                                {item.value}
                            </div>
                        </div>
                    </div>
                )) : <p className="text-sm text-slate-500 dark:text-slate-400">No data yet.</p>}
            </div>
        </div>
    );
};


const AdminPanel: React.FC<AdminPanelProps> = ({ user, onStartImpersonation }) => {
  const [activeTab, setActiveTab] = useState('usage');
  const [error, setError] = useState<string | null>(null);
  
  // Dashboard State
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [isPendingLoading, setIsPendingLoading] = useState(true);
  const [generatedCode, setGeneratedCode] = useState<AccessCode | null>(null);
  
  // User Management State
  const [users, setUsers] = useState<AdminUserView[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AdminUserView | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isActivityLogOpen, setIsActivityLogOpen] = useState(false);
  
  // Settings State
  const [measurementId, setMeasurementId] = useState('');
  const [isSettingsLoading, setIsSettingsLoading] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState('');
  
  // Usage Dashboard State
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  // Monetization Management State
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isPlansLoading, setIsPlansLoading] = useState(true);
  const [isPlanEditorOpen, setIsPlanEditorOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);


  const fetchPendingPayments = async () => {
    setIsPendingLoading(true);
    try {
        const data = await api.getPendingPayments();
        setPendingPayments(data);
    } catch (e) {
        setError('Failed to fetch pending payments.');
    } finally {
        setIsPendingLoading(false);
    }
  };

  const fetchUsers = async () => {
    setIsUsersLoading(true);
    try {
      const fetchedUsers = await api.getAllUsers();
      setUsers(fetchedUsers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (e) {
      setError('Failed to fetch users.');
    } finally {
      setIsUsersLoading(false);
    }
  };

  const fetchSettings = async () => {
    setIsSettingsLoading(true);
    try {
        const settings = await api.getAnalyticsSettings();
        setMeasurementId(settings.measurementId || '');
    } catch (e) {
        setError('Failed to fetch settings.');
    } finally {
        setIsSettingsLoading(false);
    }
  };
  
  const fetchDashboardStats = async () => {
    setIsStatsLoading(true);
    setError(null);
    try {
        const data = await api.getDashboardStats();
        setStats(data);
    } catch (e) {
        setError('Failed to fetch dashboard stats.');
    } finally {
        setIsStatsLoading(false);
    }
  };
  
  const fetchPlans = async () => {
    setIsPlansLoading(true);
    setError(null);
    try {
        const data = await api.getPlans();
        setPlans(data);
    } catch (e) {
        setError('Failed to fetch monetization plans.');
    } finally {
        setIsPlansLoading(false);
    }
  };

  useEffect(() => {
    setError(null);
    if (activeTab === 'dashboard') fetchPendingPayments();
    else if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'settings') fetchSettings();
    else if (activeTab === 'usage') fetchDashboardStats();
    else if (activeTab === 'monetization') fetchPlans();
  }, [activeTab]);

  const handleEditClick = (user: AdminUserView) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };
  
  const handleViewActivityClick = (user: AdminUserView) => {
    setSelectedUser(user);
    setIsActivityLogOpen(true);
  };

  const handleSaveCredits = async (userId: string, credits: number) => {
    try {
      await api.updateUserCredits(userId, credits);
      setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, credits } : u));
      return true;
    } catch {
      return false;
    }
  };
  
  const handleConfirmPayment = async (paymentId: string) => {
    setGeneratedCode(null);
    const payment = pendingPayments.find(p => p.id === paymentId);
    if (!payment) return;

    setPendingPayments(prev => prev.filter(p => p.id !== paymentId));

    try {
        const result = await api.processPendingPayment(paymentId);
        if (result.success === false) {
            setError(result.message);
            setPendingPayments(prev => [...prev, payment].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } else {
            setGeneratedCode(result.accessCode);
        }
    } catch (e: any) {
        setError(e.message);
        setPendingPayments(prev => [...prev, payment].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSettingsLoading(true);
    setSettingsSuccess('');
    setError(null);
    try {
        const result = await api.saveAnalyticsSettings(measurementId);
        if (result.success) {
            setSettingsSuccess('Settings saved successfully!');
            setTimeout(() => setSettingsSuccess(''), 3000);
        }
    } catch (e: any) {
        setError(e.message || 'Failed to save settings.');
    } finally {
        setIsSettingsLoading(false);
    }
  };
  
  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setIsPlanEditorOpen(true);
  };

  const handleAddNewPlan = () => {
    setEditingPlan(null); // No existing plan data for a new one
    setIsPlanEditorOpen(true);
  };
  
  const handleSavePlan = async (plan: Plan) => {
    try {
        await api.savePlan(plan);
        setIsPlanEditorOpen(false);
        fetchPlans(); // Refresh the list
        return true;
    } catch (e: any) {
        setError(e.message || 'Failed to save plan');
        return false;
    }
  };
  
  const handleDeletePlan = (plan: Plan) => {
    setPlanToDelete(plan);
    setIsConfirmDeleteOpen(true);
  };

  const confirmDeletePlan = async () => {
    if (!planToDelete || !planToDelete.id) return;
    try {
        await api.deletePlan(planToDelete.id);
        fetchPlans(); // Refresh list
    } catch (e: any) {
        setError(e.message || 'Failed to delete plan');
    } finally {
        setIsConfirmDeleteOpen(false);
        setPlanToDelete(null);
    }
  };


  const CopyableCode = ({ code }: { code: AccessCode }) => {
    const [isCopied, setIsCopied] = useState(false);
    const copyCode = () => {
        navigator.clipboard.writeText(code.code).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };
    return (
        <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-500/50 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-300">Generated code for <strong className="text-indigo-600 dark:text-indigo-300">{code.credits} credits</strong>. Send this to the user:</p>
            <div className="mt-2 flex items-center gap-2 p-2 bg-white dark:bg-slate-700 rounded-md">
                <span className="font-mono text-indigo-800 dark:text-indigo-200 flex-grow">{code.code}</span>
                <button onClick={copyCode} className="px-3 py-1 text-sm font-semibold bg-slate-200 dark:bg-slate-600 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 flex items-center gap-1.5">
                    {isCopied ? <CheckIcon className="w-4 h-4 text-green-500"/> : <ClipboardIcon className="w-4 h-4" />}
                    {isCopied ? 'Copied' : 'Copy'}
                </button>
            </div>
        </div>
    );
  };

  const renderPaymentsDashboard = () => (
    <div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Payments</h3>
        {error && <div className="text-red-500 mb-4">{error}</div>}

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
            <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Pending Payment Confirmations</h4>
            {isPendingLoading ? <Loader /> : (
                pendingPayments.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">No pending payments right now.</p>
                ) : (
                    <div className="space-y-3">
                        {pendingPayments.map(p => (
                            <div key={p.id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{p.username}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">
                                        Selected: <span className="font-medium text-indigo-600 dark:text-indigo-400">{p.planName}</span> (K{p.price.toFixed(2)})
                                    </p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500">{new Date(p.createdAt).toLocaleString()}</p>
                                </div>
                                <button
                                    onClick={() => handleConfirmPayment(p.id)}
                                    className="px-3 py-1.5 text-sm font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors self-start sm:self-center"
                                >
                                    Confirm & Generate Code
                                </button>
                            </div>
                        ))}
                    </div>
                )
            )}
            {generatedCode && <CopyableCode code={generatedCode} />}
        </div>
    </div>
  );

  const renderUserManagement = () => (
    <div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-3">
            <UsersIcon className="w-6 h-6" />
            User Management
        </h3>
        {isUsersLoading ? <div className="flex justify-center items-center h-64"><Loader /></div> : (
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-700">
                    <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Username</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Role</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Credits</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Joined</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                    {users.map((u) => (
                    <tr key={u.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{u.username}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                        {u.isAdmin ? 
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">Admin</span> : 
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">User</span>
                        }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{u.credits}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center gap-2">
                           <button onClick={() => handleViewActivityClick(u)} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full" title="View Activity Log">
                                <ClockIcon className="w-5 h-5"/>
                            </button>
                            <button onClick={() => onStartImpersonation(u.id)} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full" title="View as User">
                                <EyeIcon className="w-5 h-5"/>
                            </button>
                            <button onClick={() => handleEditClick(u)} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full" title="Edit Credits">
                                <PencilIcon className="w-5 h-5"/>
                            </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        )}
    </div>
  );

  const renderSettings = () => (
    <div>
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-3">
        <WrenchScrewdriverIcon className="w-6 h-6" />
        Settings
      </h3>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
        <form onSubmit={handleSaveSettings}>
          <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-1">Google Analytics</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
            Enter your Measurement ID to enable analytics tracking. The app will automatically initialize Google Analytics.
          </p>
          <div className="max-w-md">
            <label htmlFor="measurementId" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Measurement ID
            </label>
            <input
              id="measurementId"
              type="text"
              value={measurementId}
              onChange={(e) => setMeasurementId(e.target.value)}
              placeholder="e.g., G-XXXXXXXXXX"
              className="block w-full px-3 py-2 bg-white dark:bg-slate-700 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          {settingsSuccess && <p className="text-green-600 dark:text-green-400 text-sm mt-2">{settingsSuccess}</p>}
          <div className="mt-4">
            <button
              type="submit"
              disabled={isSettingsLoading}
              className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 flex items-center justify-center min-w-[80px]"
            >
              {isSettingsLoading ? <Loader className="w-5 h-5" /> : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderUsageDashboard = () => {
    if (isStatsLoading) return <div className="flex justify-center items-center h-64"><Loader /></div>;
    if (error) return <div className="text-red-500 mb-4">{error}</div>;
    if (!stats) return <p className="text-slate-500">No data available.</p>;

    const aiUsageData = [
        { label: 'Resume Summary', value: stats.aiFeatureUsage.resume },
        { label: 'Cover Letter', value: stats.aiFeatureUsage.coverLetter },
    ];
    
    const templateUsageData = [
        { label: 'Modern', value: stats.templateUsage.modern },
        { label: 'Classic', value: stats.templateUsage.classic },
        { label: 'Minimalist', value: stats.templateUsage.minimalist },
        { label: 'Creative', value: stats.templateUsage.creative },
    ].sort((a,b) => b.value - a.value);

    return (
        <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-3">
                <ChartBarIcon className="w-6 h-6" />
                Usage Dashboard
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <StatCard title="Total Users" value={stats.totalUsers} icon={<UsersIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />} />
                <StatCard title="New Signups (7 days)" value={stats.newSignupsLast7Days} icon={<PlusCircleIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />} />
                <StatCard title="Credits Purchased" value={stats.totalCreditsPurchased} icon={<CreditIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BarChart title="AI Feature Usage" data={aiUsageData} />
                <BarChart title="Popular Resume Templates" data={templateUsageData} />
            </div>
        </div>
    );
  };
  
  const renderMonetizationManagement = () => (
    <div>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                <CurrencyDollarIcon className="w-6 h-6" />
                Monetization Management
            </h3>
            <button
                onClick={handleAddNewPlan}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
            >
                <PlusCircleIcon className="w-5 h-5" />
                Add New Plan
            </button>
        </div>
        {isPlansLoading ? <div className="flex justify-center h-64 items-center"><Loader /></div> : (
            <div className="space-y-3">
                {plans.map(plan => (
                    <div key={plan.id} className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-md flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                        <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                {plan.name}
                                {plan.isBestValue && <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">Best Value</span>}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                <span className="font-medium text-indigo-600 dark:text-indigo-400">{plan.credits} Credits</span> for K{plan.price.toFixed(2)}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 self-start sm:self-center">
                            <button onClick={() => handleEditPlan(plan)} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full" title="Edit Plan">
                                <PencilIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDeletePlan(plan)} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-600 dark:hover:text-red-400 rounded-full" title="Delete Plan">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );


  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="md:col-span-1">
        <nav className="space-y-2">
            <button onClick={() => setActiveTab('usage')} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center gap-3 ${activeTab === 'usage' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                <ChartBarIcon className="w-5 h-5" /> Usage
            </button>
            <button onClick={() => setActiveTab('dashboard')} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center gap-3 ${activeTab === 'dashboard' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                <CreditIcon className="w-5 h-5" /> Payments
            </button>
             <button onClick={() => setActiveTab('monetization')} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center gap-3 ${activeTab === 'monetization' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                <CurrencyDollarIcon className="w-5 h-5" /> Monetization
            </button>
            <button onClick={() => setActiveTab('users')} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center gap-3 ${activeTab === 'users' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                <UsersIcon className="w-5 h-5" /> Users
            </button>
            <button onClick={() => setActiveTab('settings')} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center gap-3 ${activeTab === 'settings' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                <WrenchScrewdriverIcon className="w-5 h-5" /> Settings
            </button>
        </nav>
      </div>
      <main className="md:col-span-3">
        {activeTab === 'usage' && renderUsageDashboard()}
        {activeTab === 'dashboard' && renderPaymentsDashboard()}
        {activeTab === 'monetization' && renderMonetizationManagement()}
        {activeTab === 'users' && renderUserManagement()}
        {activeTab === 'settings' && renderSettings()}
      </main>
      <EditCreditsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
        onSave={handleSaveCredits}
      />
       <UserActivityLogModal
        isOpen={isActivityLogOpen}
        onClose={() => setIsActivityLogOpen(false)}
        user={selectedUser}
      />
      <PlanEditorModal
        isOpen={isPlanEditorOpen}
        onClose={() => setIsPlanEditorOpen(false)}
        onSave={handleSavePlan}
        plan={editingPlan}
      />
      <ConfirmationDialog
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={confirmDeletePlan}
        title="Delete Plan"
        message={`Are you sure you want to delete the "${planToDelete?.name}" plan? This action cannot be undone.`}
      />
    </div>
  );
};

export default AdminPanel;