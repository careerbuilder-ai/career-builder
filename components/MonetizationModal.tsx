// components/MonetizationModal.tsx
import React, { useState, useEffect } from 'react';
import { Plan, User } from '../types';
import * as api from '../services/apiService';
import { WhatsappIcon } from './icons/WhatsappIcon';
import { BankIcon } from './icons/BankIcon';
import Loader from './common/Loader';
import { CheckIcon } from './icons/CheckIcon';
import PlanTooltip from './PlanTooltip';
import { InfoIcon } from './icons/InfoIcon';

interface MonetizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onPurchaseSuccess: (newCredits: number) => void;
}

const ADMIN_WHATSAPP_NUMBER = '67571558359'; // PNG country code + number

const MonetizationModal: React.FC<MonetizationModalProps> = ({ isOpen, user, onPurchaseSuccess, onClose }) => {
  const [view, setView] = useState<'select' | 'instruct' | 'complete'>('select');
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredPlanId, setHoveredPlanId] = useState<string | null>(null);
  const [accessCode, setAccessCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    const fetchPlans = async () => {
        if (isOpen) {
            setIsLoading(true);
            try {
                const fetchedPlans = await api.getPlans();
                setPlans(fetchedPlans);
            } catch (e) {
                setError("Could not load credit plans.");
            } finally {
                setIsLoading(false);
            }
        }
    };
    fetchPlans();
  }, [isOpen]);

  const handleSelectPlan = async (plan: Plan) => {
    setSelectedPlan(plan);
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.logPaymentInitiation(user.id, plan.id!);
      if (result.success) {
        setView('instruct');
      } else {
        setError('Could not initiate purchase. Please try again.');
      }
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedeemCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) {
      setError('Please enter an access code.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.redeemAccessCode(user.id, accessCode);
      if (result.success === false) {
        setError(result.message);
      } else {
        onPurchaseSuccess(result.newCredits);
        setView('complete');
      }
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };
  
  const handleClose = () => {
    setView('select');
    setSelectedPlan(null);
    setError(null);
    setAccessCode('');
    onClose();
  };

  const getWhatsAppMessage = () => {
    if (!selectedPlan) return '';
    return encodeURIComponent(
      `Hello, I have made a payment for the "${selectedPlan.name}" plan for my account: ${user.username}. Here is my receipt.`
    );
  };


  if (!isOpen) {
    return null;
  }

  const renderContent = () => {
    switch (view) {
      case 'instruct':
        if (!selectedPlan) return null;
        return (
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Complete Your Purchase</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">Follow these steps to get your credits for the <span className="font-bold text-indigo-600 dark:text-indigo-400">{selectedPlan.name}</span> plan.</p>
            
            <div className="space-y-4">
              {/* Step 1 */}
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center font-bold text-slate-600 dark:text-slate-200">1</div>
                  <h3 className="font-semibold text-slate-700 dark:text-slate-200">Make Payment</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 pl-11 mb-3">Transfer <strong className="text-slate-800 dark:text-slate-100">K{selectedPlan.price.toFixed(2)}</strong> to the account below:</p>
                <div className="pl-11 space-y-2 text-sm">
                  <div className="flex items-center gap-3">
                    <BankIcon className="w-5 h-5 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                    <div>
                      <strong>Bank:</strong> Bank of South Pacific (BSP)<br />
                      <div className="flex items-center gap-2">
                        <strong>Account:</strong> 7015449890
                        <button onClick={() => copyToClipboard('7015449890')} className="px-2 py-0.5 text-xs font-semibold bg-slate-200 dark:bg-slate-600 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500">
                          {isCopied ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Step 2 */}
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center font-bold text-slate-600 dark:text-slate-200">2</div>
                  <h3 className="font-semibold text-slate-700 dark:text-slate-200">Confirm on WhatsApp</h3>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300 pl-11 mb-3">
                    <p className="mb-2">Send a WhatsApp message to the admin at <strong className="text-slate-800 dark:text-slate-100">📱 71558359</strong>, including:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>A screenshot or photo of the payment receipt</li>
                        <li>Your full name (or username: <span className="font-semibold">{user.username}</span>)</li>
                    </ul>
                </div>
                <div className="pl-11">
                    <a href={`https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${getWhatsAppMessage()}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition-colors">
                        <WhatsappIcon className="w-5 h-5"/>
                        Chat on WhatsApp
                    </a>
                </div>
              </div>
              {/* Step 3 */}
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center font-bold text-slate-600 dark:text-slate-200">3</div>
                  <h3 className="font-semibold text-slate-700 dark:text-slate-200">Redeem Your Code</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 pl-11 mb-3">Once confirmed, the admin will send you an access code. Enter it below.</p>
                <form onSubmit={handleRedeemCode} className="pl-11 flex items-start gap-2">
                  <input
                    type="text"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="Enter access code"
                    className="flex-grow px-3 py-2 bg-white dark:bg-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <button type="submit" disabled={isLoading} className="px-4 py-2 font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 flex items-center justify-center w-28">
                    {isLoading ? <Loader className="w-5 h-5" /> : 'Redeem'}
                  </button>
                </form>
                 {error && <p className="text-red-500 text-sm mt-2 pl-11">{error}</p>}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => { setView('select'); setSelectedPlan(null); }} className="px-4 py-2 text-sm font-semibold bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500">
                Back
              </button>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckIcon className="w-9 h-9 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Redemption Successful!</h2>
            <p className="text-slate-600 dark:text-slate-300 mt-2">{selectedPlan?.credits} credits have been added to your account.</p>
            <button onClick={handleClose} className="mt-6 px-6 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
              Continue
            </button>
          </div>
        );

      case 'select':
      default:
        return (
          <>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Purchase Credits</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">Choose a credit pack to unlock AI features and downloads.</p>
            {isLoading && !plans.length ? <div className="flex justify-center h-40 items-center"><Loader /></div> :
            <div className="grid sm:grid-cols-3 gap-4">
              {plans.map(plan => (
                 <div
                    key={plan.id}
                    className="relative"
                    onMouseEnter={() => setHoveredPlanId(plan.id!)}
                    onMouseLeave={() => setHoveredPlanId(null)}
                >
                    {hoveredPlanId === plan.id && <PlanTooltip plan={plan} />}
                    <button
                        onClick={() => handleSelectPlan(plan)}
                        disabled={isLoading}
                        className="relative p-4 border-2 rounded-lg text-left transition-all duration-200 w-full h-full flex flex-col justify-between border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-lg hover:scale-105 disabled:opacity-50"
                    >
                      <div>
                        {plan.isBestValue && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                                BEST VALUE
                            </div>
                        )}
                        <InfoIcon className="absolute top-2 right-2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                        <h3 className="font-bold text-slate-800 dark:text-slate-100">{plan.name}</h3>
                        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 my-2">{plan.credits} <span className="text-base font-medium text-slate-500 dark:text-slate-400">Credits</span></p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{plan.description}</p>
                      </div>
                      <div className="mt-4 text-lg font-bold text-slate-800 dark:text-slate-100">
                        K{plan.price.toFixed(2)}
                      </div>
                    </button>
                </div>
              ))}
            </div>
            }
            {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
          </>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl p-6 sm:p-8 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        {renderContent()}
      </div>
    </div>
  );
};

export default MonetizationModal;