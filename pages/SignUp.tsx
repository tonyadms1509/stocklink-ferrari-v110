

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import Logo from '../components/Logo';
import { ArrowRightIcon, BuildingStorefrontIcon, CheckBadgeIcon, WrenchScrewdriverIcon, ExclamationTriangleIcon, GiftIcon, SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { isSupabaseConfigured } from '../services/supabaseClient';

interface SignUpProps {
    onSwitchToLogin: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSwitchToLogin }) => {
  /* Fix: destructure signUp correctly from useAuth hook */
  const { signUp } = useAuth();
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.Contractor);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    // Check for referral code in hash or query
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const ref = params.get('ref');
    if (ref) setReferralCode(ref);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    if (password.length < 6) {
        setError('Password should be at least 6 characters.');
        setIsLoading(false);
        return;
    }

    if (!agreedToTerms) {
        setError('You must agree to the Terms of Service.');
        setIsLoading(false);
        return;
    }

    const resultMsg = await signUp(companyName, email, role, password, referralCode || undefined);
    if (resultMsg) {
      if (resultMsg.includes('check your email')) {
          setSuccessMessage(resultMsg);
      } else {
          setError(resultMsg);
      }
    }
    setIsLoading(false);
  };

  if (successMessage) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
          <div className="max-w-md w-full bg-slate-900 rounded-[3rem] shadow-2xl p-12 text-center border border-white/5">
            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-3xl bg-blue-600/20 mb-8 border border-blue-500/30">
                <CheckBadgeIcon className="h-12 w-12 text-blue-500" />
            </div>
            <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">Node Initialized</h2>
            <p className="text-slate-400 mb-10 text-lg">{successMessage}</p>
            <button onClick={onSwitchToLogin} className="w-full bg-white text-slate-950 font-black py-4 px-6 rounded-2xl hover:bg-slate-100 transition-all transform hover:-translate-y-1 shadow-2xl uppercase tracking-widest text-xs">
                Proceed to Login
            </button>
          </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen flex bg-white font-sans">
       <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white z-10 overflow-y-auto">
        <div className="mx-auto w-full max-w-sm lg:w-96 animate-fade-in-up">
           <div className="flex items-center gap-3 mb-10">
             <Logo className="h-12 w-auto text-primary" />
             <span className="text-3xl font-black text-gray-900 tracking-tighter italic uppercase">StockLink</span>
          </div>
          
          <div className="mb-10 text-left">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight uppercase italic">
              Initialize <span className="text-primary">Node</span>
            </h2>
            <p className="mt-2 text-sm text-gray-500 font-medium uppercase tracking-widest">
              Already have an identity?{' '}
              <button onClick={onSwitchToLogin} className="font-black text-primary hover:underline underline-offset-4">
                Sign in
              </button>
            </p>
          </div>

          {referralCode && (
              <div className="mb-8 bg-emerald-600 p-6 rounded-[2rem] text-white shadow-xl shadow-emerald-900/20 relative overflow-hidden group animate-fade-in-scale">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform text-white"><GiftIcon className="h-20 w-20"/></div>
                  <div className="relative z-10 text-left">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-1">Partner Handshake active</p>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">R50 Bonus Loaded</h3>
                    <p className="text-xs text-emerald-100 mt-2 font-medium opacity-80">This credit will be applied to your first subscription cycle automatically.</p>
                  </div>
              </div>
          )}

          <div className="mt-4">
             <form onSubmit={handleSubmit} className="space-y-6">
                <fieldset disabled={!isSupabaseConfigured} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1 text-left">Entity Classification</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                type="button" 
                                onClick={() => setRole(UserRole.Contractor)}
                                className={`flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 transition-all duration-300 ${role === UserRole.Contractor ? 'border-primary bg-blue-50 text-primary shadow-xl shadow-blue-100 scale-[1.05]' : 'border-gray-100 hover:border-gray-200 text-gray-400 grayscale opacity-60'}`}
                            >
                                <WrenchScrewdriverIcon className="h-8 w-8 mb-3"/>
                                <span className="font-black text-[10px] uppercase tracking-widest">Contractor</span>
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setRole(UserRole.Supplier)}
                                className={`flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 transition-all duration-300 ${role === UserRole.Supplier ? 'border-primary bg-blue-50 text-primary shadow-xl shadow-blue-100 scale-[1.05]' : 'border-gray-100 hover:border-gray-200 text-gray-400 grayscale opacity-60'}`}
                            >
                                <BuildingStorefrontIcon className="h-8 w-8 mb-3"/>
                                <span className="font-black text-[10px] uppercase tracking-widest">Supplier</span>
                            </button>
                        </div>
                    </div>

                    <div className="text-left">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 text-left">Business Identity</label>
                        <input 
                            type="text" required 
                            placeholder="e.g. BuildIt Master ZA"
                            className="appearance-none block w-full px-5 py-4 border-2 border-gray-100 rounded-2xl shadow-sm placeholder-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm font-bold text-gray-800 transition-all" 
                            value={companyName} onChange={e => setCompanyName(e.target.value)} 
                        />
                    </div>

                    <div className="text-left">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 text-left">Email address</label>
                        <input 
                            type="email" required 
                            placeholder="operator@company.co.za"
                            className="appearance-none block w-full px-5 py-4 border-2 border-gray-100 rounded-2xl shadow-sm placeholder-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm font-bold text-gray-800 transition-all" 
                            value={email} onChange={e => setEmail(e.target.value)} 
                        />
                    </div>

                    <div className="text-left">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1 text-left">Secure Password</label>
                        <input 
                            type="password" required 
                            placeholder="••••••••"
                            className="appearance-none block w-full px-5 py-4 border-2 border-gray-100 rounded-2xl shadow-sm placeholder-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm font-bold text-gray-800 transition-all" 
                            value={password} onChange={e => setPassword(e.target.value)} 
                        />
                    </div>

                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                id="terms"
                                name="terms"
                                type="checkbox"
                                checked={agreedToTerms}
                                onChange={e => setAgreedToTerms(e.target.checked)}
                                className="focus:ring-primary h-5 w-5 text-primary border-gray-300 rounded-lg"
                            />
                        </div>
                        <div className="ml-3 text-[10px] font-black uppercase text-gray-400 leading-relaxed tracking-wider text-left">
                            I accept the <a href="#/terms" className="text-primary hover:underline">SLA Protocols</a> and <a href="#/privacy" className="text-primary hover:underline">Privacy Handshake</a>
                        </div>
                    </div>

                    {error && <div className="text-xs font-black text-red-600 bg-red-50 p-4 rounded-2xl border border-red-100 text-center animate-shake uppercase tracking-widest">{error}</div>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-5 px-4 border border-transparent rounded-[2rem] shadow-2xl text-xs font-black uppercase tracking-[0.3em] text-white bg-slate-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform active:scale-95 disabled:opacity-70"
                    >
                        {isLoading ? (
                            <ArrowPathIcon className="h-5 w-5 animate-spin"/>
                        ) : (
                            <span className="flex items-center gap-2">Initialize Activation <ArrowRightIcon className="h-4 w-4"/></span>
                        )}
                    </button>
                </fieldset>
             </form>
          </div>
        </div>
      </div>

      <div className="hidden lg:block relative w-0 flex-1 bg-slate-900 overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-bl from-blue-700/20 to-gray-900 opacity-90 z-10"></div>
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 z-10"></div>
         <img
          className="absolute inset-0 h-full w-full object-cover grayscale opacity-40 mix-blend-overlay"
          src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
          alt="Industrial site"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-center px-20 text-white text-left">
            <h2 className="text-7xl font-black mb-8 leading-[0.9] tracking-tighter italic uppercase text-left">Expand your <span className="text-blue-500">Network Grid.</span></h2>
            <p className="text-xl text-slate-400 max-w-lg mb-12 leading-relaxed font-medium text-left">
                Sync with the national supply chain grid and join thousands of South African professionals using StockLink.
            </p>
            <div className="flex gap-4">
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
                    <SparklesIcon className="h-4 w-4 text-blue-400 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Active Nodes: 8,421</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
